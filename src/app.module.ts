import { APP_GUARD } from '@nestjs/core';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { ThrottlerModule } from '@nestjs/throttler';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { BullModule } from '@nestjs/bull';
import { loggerIns } from './common/logger';
import { HttpLoggerMiddleware } from './middlewares/http.logger.middleware';
import { CustomThrottlerGuard } from './providers/custom-throttler-guard.provider';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WinstonModule.forRoot(loggerIns),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 20,
    }),
    GoogleRecaptchaModule.forRoot({
      secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
      response: (req) => req.headers.recaptcha,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    SharedModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    Logger,
  ],
})
export class AppModule implements NestModule {
  emailProcessorInstance: any;
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
