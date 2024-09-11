import { Controller, Param, Get } from '@nestjs/common';
import { CountService } from './count.service'; 

@Controller('/clicks')
export class CountController {
  constructor(private readonly countService: CountService) {}

  @Get('/')
  async incrementAccessHomePage(): Promise<void> {
    await this.countService.incrementAccessHomePage();
  }

  @Get('/signup')
  async incrementAccessSignUpPage(): Promise<void>{
    await this.countService.incrementAccessSignUpPage();
  }

  @Get('/display')
  async display(): Promise<object>{
    const accsessHomePage = await this.countService.getAccessHomePage();
    const accessSignUpPage = await this.countService.getAccessSignUpPage();
    return {
      accsessHomePage, accessSignUpPage
    };
  }
}
