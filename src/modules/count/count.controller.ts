import { Controller, Param, Get } from '@nestjs/common';
import { CountService } from './count.service'; 

@Controller()
export class CountController {
  constructor(private readonly countService: CountService) {}

  @Get('/')
  async incrementAccessHomePage(): Promise<void> {
    await this.countService.incrementAccessHomePage();
  }

  @Get('/display')
  async display(): Promise<string>{
    const accsessHomePage = await this.countService.getAccessHomePage();
    const accessSignUpPage = await this.countService.getAccessSignUpPage();
    return `Number of Access Home Page: ${accsessHomePage} and Number of Access Sign Up Page: ${accessSignUpPage}`;
  }

}
