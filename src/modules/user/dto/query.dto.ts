import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPositiveNumber', async: false })
export class IsPositiveNumberConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any) {
    if (typeof value !== 'number') {
      return false;
    }
    return value > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a positive number.`;
  }
}

export class ValidateQuery {
  @IsInt()
  @IsOptional() // Cho phép tham số trống (optional)
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Validate(IsPositiveNumberConstraint)
  take?: number;

  @IsInt()
  @IsOptional() // Cho phép tham số trống (optional)
  @Transform(({ value }: TransformFnParams) => parseInt(value))
  @Validate(IsPositiveNumberConstraint)
  skip?: number;

  @IsString()
  @IsOptional() // Cho phép tham số trống (optional)
  q?: string;

  @IsString()
  @IsOptional() // Cho phép tham số trống (optional)
  sort?: string;
}
