import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SignupAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  fullName: string;

  @IsInt()
  @IsNotEmpty()
  generation: number;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  secretCode: string;
}
