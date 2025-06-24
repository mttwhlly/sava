import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { content, fileName } = await req.json();

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    let folderId = session.folderId;

    // If folder ID not in session, create/check it
    if (!folderId) {
      try {
        const folderRes = await drive.files.list({
          q: `name='Sava' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(id, name)',
          spaces: 'drive',
        });

        if (folderRes.data.files && folderRes.data.files.length > 0) {
          folderId = folderRes.data.files[0].id!;
        } else {
          const createRes = await drive.files.create({
            requestBody: {
              name: 'Sava',
              mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id',
          });
          folderId = createRes.data.id!;
        }

        // Note: You can't directly modify the session/token like this
        // Consider storing folder ID in a database or using a different approach
        console.log('Found/created folder ID:', folderId);
      } catch (folderError) {
        console.error('Folder creation/lookup error:', folderError);
        return NextResponse.json(
          { error: 'Failed to access Google Drive folder' },
          { status: 500 }
        );
      }
    }

    // Upload file
    try {
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

      return NextResponse.json({
        status: 'uploaded',
        file: uploadRes.data,
        folderId, // Return folder ID so frontend can store it if needed
      });
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to Google Drive' },
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
