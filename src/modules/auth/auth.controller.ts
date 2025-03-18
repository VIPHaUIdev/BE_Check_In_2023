import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ResponseMessage } from 'src/decorators/response.decorator';
import { LoginDto, LoginPayloadDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { SkipThrottle } from '@nestjs/throttler';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('auth')
@SkipThrottle(false)
// @Recaptcha()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ResponseMessage('login success')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login to get access token & user information' })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginPayloadDto,
  })
  async login(@Body() loginBody: LoginDto): Promise<LoginPayloadDto> {
    const user = await this.authService.login(loginBody);

    const token = await this.authService.createAccessToken({
      userId: user.id,
    });

    delete user.password;
    return new LoginPayloadDto(user, token);
  }
}
