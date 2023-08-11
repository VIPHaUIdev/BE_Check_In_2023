import { exec } from 'child_process';
import * as moment from 'moment';
import * as dotenv from 'dotenv';
import { loggerIns } from './logger';
dotenv.config();

function backupDB() {
  const timestamp = moment().format('YYYY_MM_DD_HH_mm_ss');
  const backupFileName = `${timestamp}.sql`;

  exec(
    `docker exec ${process.env.CONTAINER_NAME} /usr/bin/mysqldump -u ${process.env.DATABASE_USERNAME} --password=${process.env.DATABASE_PASSWORD} ${process.env.DATABASE_NAME} > backups/${backupFileName}`,
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

backupDB();
