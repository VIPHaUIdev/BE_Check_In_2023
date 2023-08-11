import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import { loggerIns } from './logger';
import * as fs from 'fs-extra';
dotenv.config();

const arg = process.argv.slice(2)[0];

function parseConnectionString(connectionString: string) {
  const matches = connectionString.match(/\/\/(.*?):(.*?)@(.*?):\d+\/(.*)/);
  if (matches) {
    const [, username, password, , database] = matches;

    return { username, password, database };
  }
  return null;
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}

function backupDB() {
  const { username, password, database } = parseConnectionString(
    process.env.DATABASE_URL,
  );
  const timestamp = formatDateTime(new Date());
  const backupFileName = `${timestamp}.sql`;

  exec(
    `docker exec db_checkin /usr/bin/mysqldump -u ${username} --password=${password} ${database} > backups/${backupFileName}`,
    (error, stdout, stderr) => {
      if (error) {
        loggerIns.error(error.message, { label: 'backupDB' });
      }
      loggerIns.info('Dump executed successfully', { label: 'backupDB' });
      loggerIns.debug(`stdout: ${stdout}`, { label: 'backupDB' });
      loggerIns.debug(`stderr: ${stderr}`, { label: 'backupDB' });
    },
  );
}

function restoreDB(fileName: string) {
  if (fs.existsSync(`backups/${fileName}`)) {
    const { username, password, database } = parseConnectionString(
      process.env.DATABASE_URL,
    );
    exec(
      `cat backups/${fileName} | docker exec -i db_checkin /usr/bin/mysql -u ${username} --password=${password} ${database}`,

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

if (arg) {
  restoreDB(arg);
} else {
  backupDB();
}
