import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FindOnePayload,
  UserDto,
  GetAllUsers,
  findAllUsersResponse,
} from './dto/user.dto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { type Prisma } from '@prisma/client';
import { generateHash } from 'src/common/utils';
import { QueryDto } from './dto/query.dto';

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

  async findAll(query: QueryDto): Promise<findAllUsersResponse> {
    let fieldSort: string = 'createdAt';
    let typeSort: string = 'asc';
    const isCheckinValue: boolean = query.isCheckin === 'true';
    if (query.sort) {
      const querySortSplit: string[] = query.sort.split(':');
      fieldSort = querySortSplit[0] || 'createdAt';
      typeSort = querySortSplit[1] || 'asc';
    }
    const [users, count]: [GetAllUsers[], number] =
      await this.prismaService.$transaction([
        this.prismaService.user.findMany({
          skip: query.page > 1 ? (query.page - 1) * query.limit : 0,
          take: query.limit || 20,
          where: {
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
              {
                isCheckin: isCheckinValue,
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
            isCheckin: true,
          },
        }),
        this.prismaService.user.count(),
      ]);
    const page: number = query.page;
    const limit: number = query.limit;
    return { users, count, limit, page };
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
