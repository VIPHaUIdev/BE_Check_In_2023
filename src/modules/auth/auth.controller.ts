import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ResponseMessage } from 'src/decorators/response.decorator';
import { LoginDto, LoginPayloadDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { SkipThrottle } from '@nestjs/throttler';
import { Recaptcha } from '@nestlab/google-recaptcha';

@Controller({
  path: 'auth',
  version: '1',
})
@SkipThrottle(false)
// @Recaptcha()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ResponseMessage('login success')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginBody: LoginDto): Promise<LoginPayloadDto> {
    const user = await this.authService.login(loginBody);

    const token = await this.authService.createAccessToken({
      userId: user.id,
    });

    delete user.password;
    return new LoginPayloadDto(user, token);
  }
}
