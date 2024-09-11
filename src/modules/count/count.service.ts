import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Exception } from 'handlebars';

@Injectable()
export class CountService {
  constructor(private readonly prisma: PrismaService) {}

  async incrementAccessPage(page: 'accessHomePage' | 'accessSignUpPage'): Promise<void> {
    const counter = await this.prisma.counter.findUnique({
      where: { id: 1 },
    });

    if (!counter) {
      throw new Exception("Counter not found!");
    }

    const newValue = counter[page] + 1;

    await this.prisma.counter.update({
      where: { id: 1 },
      data: { [page]: newValue },
    });
  }

  async incrementAccessHomePage(): Promise<void> {
    await this.incrementAccessPage('accessHomePage');
  }

  async incrementAccessSignUpPage(): Promise<void> {
    await this.incrementAccessPage('accessSignUpPage');
  }
  
  async getAccess(page: 'accessHomePage' | 'accessSignUpPage') : Promise<number>{
    const counter = await this.prisma.counter.findUnique({
      where: {id: 1},
    });
    if(!counter){
      throw new Exception("Counter not found!");
    }
    return counter[page];
  }

  async getAccessHomePage(): Promise<number>{
    return this.getAccess('accessHomePage');
  }

  async getAccessSignUpPage():Promise<number>{
    return this.getAccess('accessSignUpPage');
  }
}
