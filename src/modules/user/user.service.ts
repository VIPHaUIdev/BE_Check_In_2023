import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindOnePayload, UserDto } from './dto/user.dto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { type Prisma } from '@prisma/client'
import { generateHash } from 'src/common/utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

  async findOne(account: string): Promise<FindOnePayload | null>{
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          { phone: account },
          { email: account }
        ]
      },
      select: {
        id: true,
        fullname: true,
        password: true,
        role: true
      }
    })

    if(!user){
      throw new UserNotFoundException();
    }

    return user
  }

  create(userBody: Prisma.UserCreateInput): Promise<UserDto>{
    return this.prismaService.user.create({
      data: {...userBody, password: generateHash(userBody.password)}
    })
  }
}
