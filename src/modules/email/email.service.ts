import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import * as hbs from 'handlebars';
import * as fs from 'fs-extra';
import { EmailJobDto, GetAllJobsResponse } from './dto/email.dto';
import { QueryJobDto } from './dto/query.dto';

@Injectable()
export class EmailService {
  constructor(private readonly prismaService: PrismaService) {}

  async send(data: EmailJobDto, type?: string): Promise<void> {
    let mailOptions: object;
    if (type === 'confirm') {
      const hbsFileContent = await fs.readFile(
        `${__dirname}/templates/browsedImage.hbs`,
        'utf-8',
      );
      const template = hbs.compile(hbsFileContent);
      const html = template({
        fullName: data.fullName,
      });
      mailOptions = {
        from: 'V.I.P English Club <clbtienganhvip@gmail.com>',
        to: data.email,
        subject:
          '[V.I.P 12TH BIRTHDAY PARTY] XÁC NHẬN ĐĂNG KÝ CHECK-IN KHUÔN MẶT THÀNH CÔNG',
        html,
      };
    } else {
      const hbsFileContent = await fs.readFile(
        `${__dirname}/templates/sendQR.hbs`,
        'utf-8',
      );
      const template = hbs.compile(hbsFileContent);
      const splitName = data.fullName.split(' ');
      const html = template({
        name: splitName[splitName.length - 1],
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        userId: data.userId,
      });
      mailOptions = {
        from: 'V.I.P English Club <clbtienganhvip@gmail.com>',
        to: data.email,
        subject:
          '[V.I.P 12TH BIRTHDAY PARTY] XÁC NHẬN ĐĂNG KÝ THÀNH CÔNG SỰ KIỆN',
        html,
      };
    }
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transport.sendMail(mailOptions);
  }

  async createJob(
    userId: string,
    status: Status,
    reason?: string,
  ): Promise<void> {
    await this.prismaService.email.create({
      data: {
        status,
        userId,
        reason,
      },
    });
  }

  async updateJob(
    userId: string,
    status: Status,
    reason?: string,
  ): Promise<void> {
    await this.prismaService.email.update({
      where: { userId },
      data: {
        status,
        reason,
      },
    });
  }

  async getJobs(query: QueryJobDto): Promise<GetAllJobsResponse> {
    let fieldSort: string = 'createdAt';
    let typeSort: string = 'asc';
    if (query.sort) {
      const querySortSplit: string[] = query.sort.split(':');
      fieldSort = querySortSplit[0] || 'createdAt';
      typeSort = querySortSplit[1] || 'asc';
    }
    const where: object = {
      AND: [
        {
          user: {
            email: {
              contains: query.q || '',
            },
          },
        },
        { status: query.status },
      ],
    };
    const [emails, count] = await this.prismaService.$transaction([
      this.prismaService.email.findMany({
        skip: query.page > 1 ? (query.page - 1) * query.limit : 0,
        take: query.limit || 20,
        where,
        orderBy: {
          [fieldSort]: typeSort,
        },
        select: {
          id: true,
          status: true,
          reason: true,
          createdAt: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      this.prismaService.email.count({
        where,
      }),
    ]);
    const page: number = query.page;
    const limit: number = query.limit;
    return { emails, count, limit, page };
  }
}
