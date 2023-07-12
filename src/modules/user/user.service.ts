import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindOnePayload, UserDto } from './dto/user.dto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { type Prisma } from '@prisma/client';
import { generateHash } from 'src/common/utils';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(account: string): Promise<FindOnePayload | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ phoneNumber: account }, { email: account }],
      },
      select: {
        id: true,
        fullName: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async findAll(query: any) {
    let fieldSort = 'createdAt';
    let typeSort = 'asc';
    if (query.sort) {
      fieldSort = query.sort.split(':')[0] || 'createdAt';
      typeSort = query.sort.split(':')[1] || 'asc';
    }
    const users = await this.prismaService.user.findMany({
      skip: +query.skip || 0,
      take: +query.take || 20,
      where: {
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
      },
    });

    return users;
  }

  create(userBody: Prisma.UserCreateInput): Promise<UserDto> {
    return this.prismaService.user.create({
      data: { ...userBody, password: generateHash(userBody.password) },
    });
  }

  signup(userBody: Prisma.UserCreateInput): Promise<UserDto> {
    return this.prismaService.user.create({
      data: { ...userBody },
    });
  }
}
