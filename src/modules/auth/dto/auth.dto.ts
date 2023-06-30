import { FindOnePayload, UserDto } from 'src/modules/user/dto/user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  account: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class TokenPayloadDto {
  accessToken: string;

  constructor(data: { accessToken: string }) {
    this.accessToken = data.accessToken;
  }
}

export class LoginPayloadDto {
  user: FindOnePayload;

  token: TokenPayloadDto;

  constructor(user: FindOnePayload, token: TokenPayloadDto) {
    this.user = user;
    this.token = token;
  }
}
