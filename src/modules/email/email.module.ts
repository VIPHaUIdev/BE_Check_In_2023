import { Module } from '@nestjs/common';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EmailProcessor, EmailService],
})
export class EmailModule {}
