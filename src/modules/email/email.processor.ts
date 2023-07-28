import { Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { EmailService } from './email.service';
import { Job } from 'bull';
import { EmailJobDto } from './dto/email.dto';

@Processor('email')
@Injectable()
export class EmailProcessor {
  constructor(private emailService: EmailService) {}
  @Process('sendEmail')
  async sendEmailJob(job: Job<EmailJobDto>): Promise<void> {
    const data = { ...job.data };
    try {
      await this.emailService.sendEmail(data);
      await this.emailService.createStatusEmail(data.userId, 'SENT');
    } catch (err) {
      await this.emailService.createStatusEmail(data.userId, 'FAILED');
      console.log(err);
    }
  }
}