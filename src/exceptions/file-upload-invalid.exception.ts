import { HttpException, HttpStatus } from '@nestjs/common';

export class FileUploadIsInvalid extends HttpException {
  constructor() {
    super('Only image files are allowed!', HttpStatus.BAD_REQUEST);
  }
}
