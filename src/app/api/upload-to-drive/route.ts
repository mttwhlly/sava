import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
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

    // ✨ Save folder ID into the token/session
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    token.folderId = folderId;
  }

  // Upload file
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

  return NextResponse.json({ status: 'uploaded', file: uploadRes.data });
}
