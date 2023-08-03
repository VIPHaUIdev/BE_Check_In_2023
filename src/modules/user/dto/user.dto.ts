import { Role } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';

export class UserDto {
  id: string;
  fullName: string;
  email: string;
  generation: number;
  phoneNumber: string;
  isCheckin?: boolean;
  password?: string;
}

export class InfoUserDto {
  @IsNotEmpty()
  @MaxLength(30)
  fullName: string;

  @IsNotEmpty()
  generation: number;

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
  generation: number;
}
export class CreateUserDto extends InfoUserDto {
  @IsNotEmpty()
  password: string;
}

export class GetAllUsers {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  generation: number;
  role: string;
  createdAt: Date;
  isCheckin: boolean;
}

export class findAllUsersResponse {
  users: GetAllUsers[];
  count: number;
  limit: number;
  page: number;
}

export class CheckinUserResponse {
  fullName: string;
  generation: number;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @MaxLength(30)
  @IsOptional()
  fullName: string;

  @IsNotEmpty()
  @IsOptional()
  generation: number;

  @IsOptional()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @IsBoolean()
  @IsOptional()
  isCheckin: boolean;
}

export class UpdateUserResponse {
  fullName: string;

  generation: number;

  phoneNumber: string;

  email: string;

  role: Role;

  isCheckin: boolean;
}
