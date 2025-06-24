import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('API route called');

    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');
    console.log('Access token:', session?.accessToken ? 'Present' : 'Missing');

    if (!session?.accessToken) {
      console.log('No access token available');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { content, fileName } = await req.json();
    console.log('Request data:', { content: content?.length, fileName });

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Test basic drive access first
    try {
      console.log('Testing Drive API access...');
      const testRes = await drive.about.get({ fields: 'user' });
      console.log(
        'Drive API test successful:',
        testRes.data.user?.emailAddress
      );
    } catch (driveTestError) {
      console.error('Drive API test failed:', driveTestError);
      return NextResponse.json(
        {
          error: 'Failed to access Google Drive API',
          details: driveTestError.message,
        },
        { status: 500 }
      );
    }

    let folderId = session.folderId;

    // If folder ID not in session, create/check it
    if (!folderId) {
      try {
        console.log('Looking for Sava folder...');
        const folderRes = await drive.files.list({
          q: `name='Sava' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(id, name)',
          spaces: 'drive',
        });

        console.log('Folder search result:', folderRes.data.files);

        if (folderRes.data.files && folderRes.data.files.length > 0) {
          folderId = folderRes.data.files[0].id!;
          console.log('Found existing folder:', folderId);
        } else {
          console.log('Creating new Sava folder...');
          const createRes = await drive.files.create({
            requestBody: {
              name: 'Sava',
              mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id',
          });
          folderId = createRes.data.id!;
          console.log('Created new folder:', folderId);
        }
      } catch (folderError) {
        console.error('Folder creation/lookup error:', folderError);
        console.error('Error details:', folderError.response?.data);
        return NextResponse.json(
          {
            error: 'Failed to access Google Drive folder',
            details: folderError.message,
          },
          { status: 500 }
        );
      }
    }

    // Upload file
    try {
      console.log('Uploading file to folder:', folderId);
      const uploadRes = await drive.files.create({
        requestBody: {
          name: `${fileName}.md`,
          mimeType: 'text/markdown',
          parents: [folderId],
        },
        media: {
          mimeType: 'text/markdown',
          body: content,
        },
        fields: 'id, name, webViewLink',
      });

      console.log('Upload successful:', uploadRes.data);
      return NextResponse.json({
        status: 'uploaded',
        file: uploadRes.data,
        folderId,
      });
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      console.error('Upload error details:', uploadError.response?.data);
      return NextResponse.json(
        {
          error: 'Failed to upload file to Google Drive',
          details: uploadError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
