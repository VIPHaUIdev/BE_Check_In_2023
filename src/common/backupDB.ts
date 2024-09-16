import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import { loggerIns } from './logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DB_BACKUP_FOLDER_DRIVE } from 'src/constants';
import uploadFileToDriver from 'src/common/uploadFileDrive';
dotenv.config();

const args: string[] = process.argv.slice(2);

function parseConnectionString(connectionString: string) {
  const matches = connectionString.match(/\/\/(.*?):(.*?)@(.*?):\d+\/(.*)/);
  if (matches) {
    const [, username, password, , database] = matches;

    return { username, password, database };
  }
  return null;
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}

export function backupDB(): void {
  const { username, password, database } = parseConnectionString(
    process.env.DATABASE_URL,
  );
  const timestamp = formatDateTime(new Date());
  const backupFileName = `${timestamp}.sql`;

  exec(
    `docker exec mysql_checkin /usr/bin/mysqldump -u ${username} --password=${password} ${database} > backups/${backupFileName}`,
    (error, stdout, stderr) => {
      if (error) {
        loggerIns.error(error.message, { label: 'backupDB' });
      }
      loggerIns.info('Dump executed successfully', { label: 'backupDB' });
      loggerIns.debug(`stdout: ${stdout}`, { label: 'backupDB' });
      loggerIns.debug(`stderr: ${stderr}`, { label: 'backupDB' });
    },
  );

  uploadFileToDriver(
    DB_BACKUP_FOLDER_DRIVE,
    path.join(__dirname, '..', '..', 'backups', backupFileName),
  );
}

function restoreDB(fileName: string): void {
  if (fs.existsSync(`backups/${fileName}`)) {
    const { username, password, database } = parseConnectionString(
      process.env.DATABASE_URL,
    );
    exec(
      `cat backups/${fileName} | docker exec -i mysql_checkin /usr/bin/mysql -u ${username} --password=${password} ${database}`,

      (error, stdout, stderr) => {
        if (error) {
          loggerIns.error(error.message, { label: 'restoreDB' });
        }
        loggerIns.info('Restore database successfully', { label: 'restoreDB' });
        loggerIns.debug(`stdout: ${stdout}`, { label: 'restoreDB' });
        loggerIns.debug(`stderr: ${stderr}`, { label: 'restoreDB' });
      },
    );
  } else {
    loggerIns.error('File name is invalid', { label: 'restoreDB' });
  }
}

if (args[0] === 'restore') {
  restoreDB(args[1]);
} else if (args[0] === 'backup') {
  backupDB();
}
