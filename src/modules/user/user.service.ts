import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDTO } from './dto/user.dto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { type Prisma } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

  async findOne(id: string): Promise<UserDTO | null>{
    const user = await this.prismaService.user.findUnique({ where: { id } })
    if(!user){
      throw new UserNotFoundException();
    }
    return user
  }

  create(userBody: Prisma.UserCreateInput): Promise<UserDTO>{
    return this.prismaService.user.create({
      data: userBody
    })
  }
}
