import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UserDTO{
  id: string 
  fullname: string
  studentCode: string
  phone: string
  isCheckin: boolean;
  password: string
}

export class CreateUserDTO {
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
}