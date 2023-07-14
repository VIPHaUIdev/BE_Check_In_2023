import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UserDto {
  id: string;
  fullName: string;
  generation: string;
  phoneNumber: string;
  isCheckin?: boolean;
  password?: string;
}

export class InfoUserDto {
  @IsNotEmpty()
  @MaxLength(30)
  fullName: string;

  @IsNotEmpty()
  generation: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class FindOnePayload {
  id: string;
  role: string;
  fullName: string;
  password: string;
}

export class CreateUserDto extends InfoUserDto {
  @IsNotEmpty()
  password: string;
}
