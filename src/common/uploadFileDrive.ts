import { google, drive_v3 } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { loggerIns } from './logger';
import { DB_DRIVE_KEYPATH_NAME } from 'src/constants';

async function uploadFileToDriver(
  folderName: string,
  filePath: string,
): Promise<drive_v3.Schema$File> {
  const drive = google.drive({ version: 'v3', auth }) as drive_v3.Drive;
  const folderId = await ensureFolderExists(drive, folderName);
  const fileMetadata = {
    name: path.basename(filePath),
    parents: [folderId],
    mimeType: 'text/plain',
  };
  const media = {
    mimeType: 'text/plain',
    body: fs.createReadStream(filePath),
  };
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink, webContentLink, owners',
  });
  loggerIns.info('Uploaded file backup db to Google Drive successfully');
  return response.data;
}

async function ensureFolderExists(
  drive: drive_v3.Drive,
  folderName: string,
): Promise<string> {
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  } else {
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });
    return folder.data.id;
  }
}

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '..', '..', DB_DRIVE_KEYPATH_NAME),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

export default uploadFileToDriver;
