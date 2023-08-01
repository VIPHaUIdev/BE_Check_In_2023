import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import * as hbs from 'handlebars';
import * as fs from 'fs-extra';
import { EmailJobDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly prismaService: PrismaService) {}

  async send(data: EmailJobDto): Promise<void> {
    const hbsFileContent = await fs.readFile(
      `${__dirname}/templates/sendQR.hbs`,
      'utf-8',
    );
    const template = hbs.compile(hbsFileContent);
    const html = template({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      userId: data.userId,
    });
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: 'V.I.P English Club <clbtienganhvip@gmail.com>',
      to: data.email,
      subject:
        '[V.I.P English Club] Xác nhận đăng ký sự kiện sinh nhật thành công',
      html,
    };

    await transport.sendMail(mailOptions);
  }

  async createJob(
    userId: string,
    status: Status,
    reason?: string,
  ): Promise<void> {
    try {
      await this.prismaService.email.create({
        data: {
          status,
          userId,
          reason,
        },
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  async updateJob(
    userId: string,
    status: Status,
    reason?: string,
  ): Promise<void> {
    try {
      await this.prismaService.email.update({
        where: { userId },
        data: {
          status,
          reason,
        },
      });
    } catch (err) {
      throw new Error(err);
    }
  }
}
