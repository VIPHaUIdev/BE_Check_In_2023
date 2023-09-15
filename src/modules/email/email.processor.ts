import { Inject, Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { EmailService } from './email.service';
import { Job } from 'bull';
import { EmailJobDto } from './dto/email.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Processor('email')
@Injectable()
export class EmailProcessor {
  constructor(
    private emailService: EmailService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  @Process('sendEmail')
  async sendJob(job: Job<EmailJobDto>): Promise<void> {
    const data = { ...job.data };
    try {
      await this.emailService.createJob(data.userId, 'PENDING');
      this.logger.info(`Send email to ${data.email}`, {
        label: 'sendJob',
      });

      await this.emailService.send(data);
      await this.emailService.updateJob(data.userId, 'SUCCESS');
    } catch (err) {
      await this.emailService.updateJob(data.userId, 'ERROR', err.response);
      this.logger.error(err.stack, { label: 'sendJob' });
    }
  }

  @Process('sendEmailConfirm')
  async sendConfirmJob(job: Job<EmailJobDto>): Promise<void> {
    try {
      const data = { ...job.data };
      await this.emailService.send(data, 'confirm');
      this.logger.info(`Send email to ${data.email}`, {
        label: 'sendConfirmJob',
      });
    } catch (err) {
      this.logger.error(err.stack, { label: 'sendConfirmJob' });
    }
  }
}
