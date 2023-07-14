import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UserDto {
  id: string;
  fullName: string;
  generation: string;
  phoneNumber: string;
  isCheckin?: boolean;
  password?: string;
}

export class ValidateUserDto {
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

export class CreateUserDto extends ValidateUserDto {
  @IsNotEmpty()
  password: string;
}

export class GetAllUsers {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  generation: string;
  role: string;
  createdAt: Date;
  isCheckin: boolean;
}

export class findAllUsers {
  users: GetAllUsers[];

  count: number;

  limit: number;

  page: number;
}
