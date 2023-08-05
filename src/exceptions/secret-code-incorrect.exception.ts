import { HttpException, HttpStatus } from '@nestjs/common';

export class SecretCodeIsIncorrect extends HttpException {
  constructor() {
    super('secret code is incorrect', HttpStatus.BAD_REQUEST);
  }
}
