import { Controller, Get, Post } from '@nestjs/common';
import { CountService } from './count.service'; 

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
  async display(): Promise<object> {
    const accessHomePage = await this.countService.getAccess('/home'); 
    const accessSignUpPage = await this.countService.getAccess('/signup'); 
    return {
      accessHomePage, 
      accessSignUpPage
    };
  }
}
