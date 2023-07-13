import { Transform, TransformFnParams } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ValidateQuery {
  @IsInt()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Min(1)
  take?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Min(0)
  skip?: number;

  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  sort?: string;
}
