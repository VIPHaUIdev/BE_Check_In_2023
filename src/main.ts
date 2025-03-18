import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { HttpExceptionFilter } from './filters/bad-request.filter';
import { PrismaClientExceptionFilter } from './filters/prisma-client.filter';
import { TransformInterceptor } from './interceptors/response.interceptor';
import { loggerIns } from './common/logger';
import { ErrorsInterceptor } from './interceptors/errors.interceptor';
import * as schedule from 'node-schedule';
import { backupDB } from './common/backupDB';
import { GoogleRecaptchaFilter } from './filters/recaptcha.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(loggerIns),
    cors: true,
  });
  app.setGlobalPrefix('api');
  const reflector = app.get(Reflector);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new PrismaClientExceptionFilter(reflector),
    new GoogleRecaptchaFilter(),
  );

  app.useGlobalInterceptors(
    new ErrorsInterceptor(loggerIns),
    new TransformInterceptor(reflector),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Check-in Birthday Project')
      .setDescription(
        'This document includes all the APIs for the Check-in Birthday Project',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build();

    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    };
    const documentFactory = () =>
      SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('docs', app, documentFactory);
  }

  schedule.scheduleJob('0 * * * *', () => {
    backupDB();
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  console.log('Application is starting...');
  await app.listen(process.env.PORT ?? 3000);
  console.log('Application is running on: ' + (await app.getUrl()));
}

bootstrap();
