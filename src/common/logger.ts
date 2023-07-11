import * as winston from 'winston';
import 'winston-daily-rotate-file';

const enumerateErrorFormat = winston.format((info) => {
  if (info.level == 'error') {
    const message = info.message.split('\n').slice(0, 3);
    info = { ...info, message };
  }
  return info;
});

const fileTransport = new winston.transports.DailyRotateFile({
  level: 'info',
  filename: './logs/log_%DATE%.log',
  datePattern: 'DD_MM_YYYY',
  zippedArchive: true,
  maxSize: '100m',
  maxFiles: '14d',
});

export const formatLog = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `[ ${timestamp} ] [ ${label} ] [ ${level} ] : ${message}`;
  },
);

export const loggerIns = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.label({ label: 'common' }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    enumerateErrorFormat(),
    winston.format.splat(),
    formatLog,
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
      format: winston.format.combine(winston.format.colorize(), formatLog),
    }),
    // new winston.transports.File({ filename: './logs/vip.log' }),
    fileTransport,
  ],
});
