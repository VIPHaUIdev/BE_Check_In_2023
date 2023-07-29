import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import * as hbs from 'handlebars';
import * as fs from 'fs-extra';
import { EmailJobDto, EmailRespone } from './dto/email.dto';

@Injectable()
export class EmailService {
  private oAuth2Client: any;
  constructor(private readonly prismaService: PrismaService) {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.EMAIL_CLIENT_ID,
      process.env.EMAIL_CLIENT_SECRET,
      process.env.EMAIL_REDIRECT_URI,
    );

    this.oAuth2Client.setCredentials({
      refresh_token: process.env.EMAIL_REFRESH_TOKEN,
    });
  }

  async sendEmail(data: EmailJobDto): Promise<void> {
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

    const accessToken = await this.oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'clbtienganhvip@gmail.com',
        clientId: process.env.EMAIL_CLIENT_ID,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN,
        accessToken,
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

  async createStatusEmail(
    userId: string,
    status: Status,
    reason?: string,
  ): Promise<EmailRespone> {
    const email = await this.prismaService.email.create({
      data: {
        status,
        userId,
        reason,
      },
    });

    return email;
  }

  async updateStatusEmail(
    userId: string,
    status: Status,
  ): Promise<EmailRespone> {
    const updatedEmail = await this.prismaService.email.update({
      where: { userId },
      data: {
        status,
      },
    });

    return updatedEmail;
  }
}
