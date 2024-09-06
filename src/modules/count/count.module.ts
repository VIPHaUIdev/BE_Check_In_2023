import { Module } from '@nestjs/common';
import { CountService } from './count.service';
import { CountController } from './count.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CountService,PrismaService],
  controllers: [CountController],
  exports: [CountService],
})
export class CountModule {
}
