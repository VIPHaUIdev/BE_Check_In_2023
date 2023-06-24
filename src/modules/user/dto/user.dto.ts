import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UserDto{
  id: string 
  fullname: string
  studentCode: string
  phone: string
  isCheckin: boolean;
  password: string
}

export class FindOnePayload{
  id: string
  role: string
  fullname: string
  password: string
}

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(30)
  fullname: string

  @IsNotEmpty()
  studentCode: string

  @IsNotEmpty()
  phone: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string
}