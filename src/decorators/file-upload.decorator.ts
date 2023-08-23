import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileUploadIsInvalid } from 'src/exceptions/file-upload-invalid.exception';

export function FileUpload(fieldName: string) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix = crypto.randomBytes(20).toString('hex');
            const ext = path.extname(file.originalname);
            const phoneNumber = req.body.phoneNumber || req['user'].phoneNumber;
            cb(null, `${phoneNumber}_${uniqueSuffix}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.startsWith('image/')) {
            return cb(new FileUploadIsInvalid(), false);
          }
          cb(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
      }),
    ),
  );
}
