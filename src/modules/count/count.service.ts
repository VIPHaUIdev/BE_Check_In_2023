import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Exception } from 'handlebars';

@Injectable()
export class CountService {
  constructor(private readonly prisma: PrismaService) {}

  async incrementAccessHomePage(): Promise<void> {
    const counter = await this.prisma.counter.findUnique({
      where:{id :1},
    });
    if(!counter){
      throw new Exception("Counter not found!");
    }
    const newValue = counter.accessHomePage + 1;
    await this.prisma.counter.update({
      where: { id: 1 },
      data: { accessHomePage: newValue },
    });
  }

  async getAccessHomePage(): Promise<number>{
    const counter = await this.prisma.counter.findUnique({
      where:{id :1},
    });
    if(!counter){
      throw new Exception("Counter not found!");
    }
    return counter.accessHomePage;
  }

  async getAccessSignUpPage(): Promise<number>{
    const counter = await this.prisma.counter.findUnique({
      where:{id :1},
    });
    if(!counter){
      throw new Exception("Counter not found!");
    }
    return counter.accessSignUpPage;
  }
}
