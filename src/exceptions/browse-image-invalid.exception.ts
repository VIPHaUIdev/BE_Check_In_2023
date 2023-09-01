import { HttpException, HttpStatus } from '@nestjs/common';

export class BrowseImageIsInValid extends HttpException {
  constructor() {
    super('image is invalid', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
