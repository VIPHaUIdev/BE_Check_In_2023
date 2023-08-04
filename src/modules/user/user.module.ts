import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, EmailService],
  exports: [UserService],
})
export class UserModule {}
