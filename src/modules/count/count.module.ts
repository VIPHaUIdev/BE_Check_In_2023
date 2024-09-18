import { Module } from '@nestjs/common';
import { CountService } from './count.service';
import { CountController } from './count.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<number>(
            'JWT_ACCESS_EXPIRATION_MINUTES',
          )}m`,
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule,
  ],
  providers: [CountService, PrismaService],
  controllers: [CountController],
  exports: [CountService],
})
export class CountModule {}
