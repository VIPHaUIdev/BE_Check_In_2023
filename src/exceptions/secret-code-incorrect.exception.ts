import { HttpException, HttpStatus } from '@nestjs/common';

export class SecretCodeIsIncorrect extends HttpException {
  constructor() {
    super('Not Found', HttpStatus.NOT_FOUND);
  }
}
