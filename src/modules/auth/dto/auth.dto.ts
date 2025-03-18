import { FindOnePayload } from 'src/modules/user/dto/user.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  account: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class TokenPayloadDto {
  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  constructor(data: { accessToken: string }) {
    this.accessToken = data.accessToken;
  }
}

export class LoginPayloadDto {
  @ApiProperty({ description: 'User information' })
  user: FindOnePayload;

  @ApiProperty({ description: 'Token information' })
  token: TokenPayloadDto;

  constructor(user: FindOnePayload, token: TokenPayloadDto) {
    this.user = user;
    this.token = token;
  }
}
