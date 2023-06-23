import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

  findOne(id: string): Promise<UserDTO | null>{
    return this.prismaService.user.findUnique({ where: { id } })
  }
}
