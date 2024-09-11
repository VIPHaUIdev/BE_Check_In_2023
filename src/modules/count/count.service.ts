import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CountService {
  constructor(private readonly prisma: PrismaService) {}

  async incrementAccess(url: string): Promise<void> {
    const page = this.getPageKey(url);
    if (!page) throw new BadRequestException("Error !");

    await this.prisma.counter.update({
      where: { id: 1 },
      data: { [page]: {  increment: 1 }},
    });
  }

  async getAccess(url: string): Promise<number> {
    const page = this.getPageKey(url);
    if (!page) throw new BadRequestException("Error !");

    const counter = await this.prisma.counter.findUnique({ where: { id: 1 } });
    if (!counter) throw new BadRequestException("Error !");

    return counter[page];
  }

  private getPageKey(url: string): string | null {
    if (url === '/home') return 'accessHomePage';
    if (url === '/signup') return 'accessSignUpPage';
    return null;
  }
}
