import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Exception } from 'handlebars';
import {
  UserDto,
  GetAllUsers,
  findAllUsersResponse,
  CheckinUserResponse,
  UpdateUserDto,
  UpdateUserResponse,
  FindOnePayload,
  CreateUserDto,
} from './dto/user.dto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { type Prisma } from '@prisma/client';
import { generateHash } from 'src/common/utils';
import { QueryUserDto } from './dto/query.dto';
import { SseService } from 'src/shared/services/sse.service';
import * as ExcelJS from 'exceljs';
import { NotFoundException } from 'src/exceptions/not-found.exception';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs-extra';
import { join } from 'path';
import { ImageIsInvalid } from 'src/exceptions/image-invalid.exception';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private sseService: SseService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findOne(account: string): Promise<FindOnePayload | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ phoneNumber: account }, { email: account }],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        generation: true,
        phoneNumber: true,
        role: true,
        password: true,
        isCheckin: true,
        facebook: true,
        image: true,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async findAll(query: QueryUserDto): Promise<findAllUsersResponse> {
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
          OR: [
            {
              fullName: {
                contains: query.q || '',
              },
            },
            {
              email: {
                contains: query.q || '',
              },
            },
            {
              phoneNumber: {
                contains: query.q || '',
              },
            },
          ],
        },
        { isCheckin: query.isCheckin },
      ],
    };
    const [users, count]: [GetAllUsers[], number] =
      await this.prismaService.$transaction([
        this.prismaService.user.findMany({
          skip: query.page > 1 ? (query.page - 1) * query.limit : 0,
          take: query.limit || 20,
          where,
          orderBy: {
            [fieldSort]: typeSort,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            generation: true,
            role: true,
            createdAt: true,
            isCheckin: true,
            facebook: true,
            image: true,
            isAccessImage: true,
          },
        }),
        this.prismaService.user.count({
          where,
        }),
      ]);
    const page: number = query.page;
    const limit: number = query.limit;
    return { users, count, limit, page };
  }

  async findOneById(id: string): Promise<FindOnePayload | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        generation: true,
        phoneNumber: true,
        role: true,
        password: true,
        isCheckin: true,
        facebook: true,
        image: true,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async checkin(
    account: string,
    type: string = 'id',
  ): Promise<CheckinUserResponse> {
    const user =
      type === 'email-phone'
        ? await this.findOne(account)
        : await this.findOneById(account);
    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: { isCheckin: true },
      select: {
        fullName: true,
        generation: true,
      },
    });

    this.sseService.send(user.id);

    return updatedUser;
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new UserNotFoundException();
    }
    data.generation = +data.generation;
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { ...data },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        generation: true,
        role: true,
        createdAt: true,
        isCheckin: true,
        facebook: true,
        image: true,
      },
    });

    return updatedUser;
  }

  async create(userBody: Prisma.UserCreateInput): Promise<UserDto> {
    return await this.prismaService.user.create({
      data: { ...userBody, password: generateHash(userBody.password) },
    });
  }

  async signupAdmin(
    signupAdmin: CreateUserDto,
    code: string,
  ): Promise<UserDto> {
    if (code !== process.env.API_ADMIN_SECRET) {
      throw new NotFoundException();
    }
    return await this.prismaService.user.create({
      data: {
        ...signupAdmin,
        password: generateHash(signupAdmin.password),
        role: 'ADMIN',
      },
    });
  }

  async signup(userBody: Prisma.UserCreateInput): Promise<UserDto> {
    userBody.generation = +userBody.generation;
    return await this.prismaService.user.create({
      data: { ...userBody },
    });
  }

  async exportUsersToExcel(): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách người đăng ký');
    let stt: number = 0;

    const users = await this.prismaService.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 15 },
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Họ và tên', key: 'fullName', width: 30 },
      { header: 'Khoá', key: 'generation', width: 30 },
      { header: 'Số điện thoại', key: 'phoneNumber', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Trạng thái check in', key: 'isCheckin', width: 20 },
      { header: 'Ngày đăng ký', key: 'createdAt', width: 30 },
    ];

    for (const user of users) {
      stt += 1;
      worksheet.addRow({
        stt,
        id: user.id,
        fullName: user.fullName,
        generation: user.generation,
        phoneNumber: user.phoneNumber,
        email: user.email,
        isCheckin: user.isCheckin === true ? 'Đã checkin' : 'Chưa checkin',
        createdAt: user.createdAt
          .toISOString()
          .slice(0, 19)
          .split('T')
          .join(' '),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generateToken(userId: string): Promise<string> {
    return await this.jwtService.signAsync({ userId });
  }
  async checkLink(
    userId: string,
    token: string,
    answer?: boolean,
  ): Promise<object | null> {
    if (answer === undefined || answer === true) {
      if ((await this.cacheManager.get(userId)) === token) {
        throw new UnauthorizedException();
      }
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      });
      return user;
    }
    await this.cacheManager.set(userId, token);
    return null;
  }
  async updateImage(
    userId: string,
    token: string,
    image: string,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { image },
    });
    await this.cacheManager.set(userId, token);
  }

  async checkinByFace(image: Buffer): Promise<CheckinUserResponse> {
    try {
      const formData = new FormData();
      formData.append('img', image, 'face.png');
      const res = await axios.post(process.env.API_CHECKIN_FACE, formData);
      const updatedUser = await this.checkin(res.data.phone, 'email-phone');
      return updatedUser;
    } catch (err) {
      throw new NotFoundException();
    }
  }
  async browseImage(id: string): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { image: true, phoneNumber: true, fullName: true },
    });

    const imagePath = join(__dirname, '../../..', `uploads/${user.image}`);
    const formData = new FormData();
    formData.append('phone', user.phoneNumber);
    formData.append('name', user.fullName);
    formData.append('img', fs.createReadStream(imagePath));

    const response = await axios.post(process.env.API_AI, formData);
    if (response.data.valid !== true) {
      throw new ImageIsInvalid();
    }
    return await this.prismaService.user.update({
      where: { id },
      data: { isAccessImage: true },
    });
  }

  async deleteOne(id: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) throw new UserNotFoundException();
    await this.prismaService.email.delete({ where: { userId: id } });
    await this.prismaService.user.delete({ where: { id } });
  }

  // async incrementAccessSignUpPage() : Promise<void>{
  //   const counter = await this.prismaService.counter.findUnique({
  //     where: {id: 1}
  //   })
  //   if(!counter){
  //     throw new Exception("Counter not found!");
  //   }
  //   const newValue = counter.accessSignUpPage + 1;
  //   await this.prismaService.counter.update({
  //     where: { id: 1 },
  //     data: { accessSignUpPage: newValue },
  //   });
  // }
}
