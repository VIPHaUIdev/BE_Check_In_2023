import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QueryUserDto {
  @ApiProperty()
  @IsInt()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Min(1)
  @IsIn([10, 20, 50, 100, 200])
  limit?: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Min(0)
  page?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiProperty({ enumName: 'boolean', enum: ['true', 'false'] })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isCheckin?: boolean;
}
