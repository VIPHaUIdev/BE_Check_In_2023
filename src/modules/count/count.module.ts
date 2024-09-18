import { Module } from '@nestjs/common';
import { CountService } from './count.service';
import { CountController } from './count.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [CountService, PrismaService, AuthService],
  controllers: [CountController],
  exports: [CountService],
})
export class CountModule {}
