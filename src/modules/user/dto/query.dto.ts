import { Transform, TransformFnParams } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Min(1)
  @IsIn([20, 50, 100, 200])
  limit?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Min(0)
  page?: number;

  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  sort?: string;
}
