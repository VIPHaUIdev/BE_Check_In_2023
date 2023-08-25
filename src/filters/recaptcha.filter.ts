import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { GoogleRecaptchaException } from '@nestlab/google-recaptcha';

@Catch(GoogleRecaptchaException)
export class GoogleRecaptchaFilter implements ExceptionFilter {
  catch(exception: GoogleRecaptchaException, host: ArgumentsHost): any {
    const res: Response = host.switchToHttp().getResponse();
    const statusCode = HttpStatus.BAD_REQUEST;
    res.status(statusCode).json({
      statusCode,
      error: 'reCAPTCHA validation failed',
    });
  }
}
