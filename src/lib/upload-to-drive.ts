import { google } from 'googleapis';

export async function uploadMarkdownToDrive({
  accessToken,
  fileName,
  content,
}: {
  accessToken: string;
  fileName: string;
  content: string;
}) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // STEP 1: Check if "Sava" folder exists
  const folderRes = await drive.files.list({
    q: `name='Sava' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  let folderId: string;

  if (folderRes.data.files && folderRes.data.files.length > 0) {
    folderId = folderRes.data.files[0].id!;
  } else {
    // STEP 2: Create it if not found
    const folderMetadata = {
      name: 'Sava',
      mimeType: 'application/vnd.google-apps.folder',
    };

    const createRes = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    folderId = createRes.data.id!;
  }

  // STEP 3: Upload file into the "Sava" folder
  const fileMetadata = {
    name: `${fileName}.md`,
    mimeType: 'text/markdown',
    parents: [folderId],
  };

  const media = {
    mimeType: 'text/markdown',
    body: content,
  };

  const uploadRes = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, name, webViewLink',
  });

  return uploadRes.data;
}
