import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindOnePayload, InfoUserDto, UserDto } from './dto/user.dto';
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

  async checkin(id: string): Promise<InfoUserDto> {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new UserNotFoundException();
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { isCheckin: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        generation: true,
        role: true,
        createdAt: true,
        isCheckin: true,
      },
    });

    return updatedUser;
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
