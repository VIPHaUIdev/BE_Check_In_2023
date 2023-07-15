import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyCheckedInException extends HttpException {
  constructor() {
    super('user has already checked in', HttpStatus.BAD_REQUEST);
  }
}
