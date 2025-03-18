import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DisplayResponseDto {
  @ApiProperty({ description: 'Total access home page' })
  @IsNumber()
  accessHomePage: number;

  @ApiProperty({ description: 'Total access register page' })
  @IsNumber()
  accessSignUpPage: number;
}
