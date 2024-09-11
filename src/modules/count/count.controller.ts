import { Controller, Get } from '@nestjs/common';
import { CountService } from './count.service'; 

@Controller('/clicks')
export class CountController {
  constructor(private readonly countService: CountService) {}

  @Get('/home')
  async incrementAccessHomePage(): Promise<void> {
    await this.countService.incrementAccess('/home');
  }

  @Get('/signup')
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
