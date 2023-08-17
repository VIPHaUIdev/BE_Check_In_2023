import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenHasExpired extends HttpException {
  constructor() {
    super('Token has expired', HttpStatus.BAD_REQUEST);
  }
}
