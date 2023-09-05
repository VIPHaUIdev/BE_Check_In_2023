import { HttpException, HttpStatus } from '@nestjs/common';

export class ImageIsInvalid extends HttpException {
  constructor() {
    super('image is invalid', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
