import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenHasExpired extends HttpException {
  constructor() {
    super('token has expired', HttpStatus.BAD_REQUEST);
  }
}
