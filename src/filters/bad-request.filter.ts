import { ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Catch, UnprocessableEntityException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ValidationError } from 'class-validator';
import type { Response } from 'express';

@Catch(UnprocessableEntityException)
export class HttpExceptionFilter
  implements ExceptionFilter<UnprocessableEntityException>
{
  constructor(public reflector: Reflector) {}

  catch(exception: UnprocessableEntityException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const r = exception.getResponse() as { message: ValidationError[] };
    const resValidate = {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: "Validate error",
      message: {}
    };

    for(const m of r.message) {
      resValidate.message[m.property] = Object.values(m.constraints)
    }
    response.status(statusCode).json(resValidate);
  }
}
