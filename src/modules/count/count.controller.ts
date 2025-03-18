import { Controller, Get, Post } from '@nestjs/common';
import { CountService } from './count.service';
import { Admin } from 'src/decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DisplayResponseDto } from './dto/count.dto';

@Controller('/clicks')
@ApiTags('count')
export class CountController {
  constructor(private readonly countService: CountService) {}

  @Post('/home')
  @ApiOperation({ summary: 'Increment access home page' })
  @ApiResponse({ status: 200 | 201, description: 'Increment access home page' })
  async incrementAccessHomePage(): Promise<void> {
    await this.countService.incrementAccess('/home');
  }

  @Post('/signup')
  @ApiOperation({ summary: 'Increment access register page' })
  @ApiResponse({
    status: 200 | 201,
    description: 'Increment access register page',
  })
  async incrementAccessSignUpPage(): Promise<void> {
    await this.countService.incrementAccess('/signup');
  }

  @Get('/display')
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({
    summary: 'Display total access home page & register page by admin',
  })
  @Admin()
  @ApiResponse({
    status: 200,
    description: 'Display total access home page & register page',
    type: DisplayResponseDto,
  })
  async display(): Promise<DisplayResponseDto> {
    const accessHomePage = await this.countService.getAccess('/home');
    const accessSignUpPage = await this.countService.getAccess('/signup');
    return {
      accessHomePage,
      accessSignUpPage,
    };
  }
}
