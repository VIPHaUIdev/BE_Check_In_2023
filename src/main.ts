import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, UnprocessableEntityException, ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/bad-request.filter';
import { PrismaClientExceptionFilter } from './filters/prisma-client.filter';
import { TransformInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const reflector = app.get(Reflector);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1"
  });

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new PrismaClientExceptionFilter(reflector)
  );

  app.useGlobalInterceptors(
    new TransformInterceptor(reflector)
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    })
  );

  await app.listen(3000);
}

bootstrap();
