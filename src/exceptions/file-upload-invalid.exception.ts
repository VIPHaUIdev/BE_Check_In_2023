import { HttpException, HttpStatus } from '@nestjs/common';

export class FileUploadIsInvalid extends HttpException {
  constructor() {
    super('only image files are allowed!', HttpStatus.BAD_REQUEST);
  }
}
