import { Controller, Get, Post } from '@nestjs/common';
import { CountService } from './count.service';
import { Admin } from 'src/decorators/auth.decorator';

@Controller('/clicks')
export class CountController {
  constructor(private readonly countService: CountService) {}

  @Post('/home')
  async incrementAccessHomePage(): Promise<void> {
    await this.countService.incrementAccess('/home');
  }

  @Post('/signup')
  async incrementAccessSignUpPage(): Promise<void> {
    await this.countService.incrementAccess('/signup');
  }

  @Get('/display')
  @Admin()
  async display(): Promise<object> {
    const accessHomePage = await this.countService.getAccess('/home');
    const accessSignUpPage = await this.countService.getAccess('/signup');
    return {
      accessHomePage,
      accessSignUpPage,
    };
  }
}
