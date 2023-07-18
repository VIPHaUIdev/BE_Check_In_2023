import { Body, Injectable } from '@nestjs/common';
import { LoginDto, TokenPayloadDto } from './dto/auth.dto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { UserService } from '../user/user.service';
import { validateHash } from 'src/common/utils';
import { TokenType } from 'src/constants';
import { JwtService } from '@nestjs/jwt';
import { FindOnePayload } from '../user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private userService: UserService,
  ) {}

  async createAccessToken(data: { userId: string }): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      accessToken: await this.jwtService.signAsync({
        userId: data.userId,
        type: TokenType.ACCESS_TOKEN,
      }),
    });
  }

  async login(@Body() loginBody: LoginDto): Promise<FindOnePayload> {
    const user = await this.userService.findOne(loginBody.account);
    if (!user) {
      throw new UserNotFoundException();
    }

    const isPasswordValid = await validateHash(
      loginBody.password,
      user?.password,
    );

    if (!isPasswordValid) {
      throw new UserNotFoundException();
    }

    return user;
  }
}
