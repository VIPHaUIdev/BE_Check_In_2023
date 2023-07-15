import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyCheckedInException extends HttpException {
  constructor() {
    super('User has already checked in', HttpStatus.BAD_REQUEST);
  }
}
