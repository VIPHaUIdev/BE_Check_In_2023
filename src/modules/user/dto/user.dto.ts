import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
  IsString,
} from 'class-validator';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  generation: number;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isCheckin?: boolean;

  @ApiProperty()
  password?: string;

  @ApiProperty()
  facebook: string;
}

export class InfoUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  generation: number;

  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  facebook: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;
}

export class FindOnePayload {
  @ApiProperty()
  id: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  generation: number;

  @ApiProperty()
  isCheckin: boolean;

  @ApiProperty()
  facebook: string;

  @ApiProperty()
  image: string;
}
export class CreateUserDto extends InfoUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  password: string;
}

export class GenerateLinkResponseDto {
  @ApiProperty()
  token: string;
}

export class RenewQrCodeResponseDto {
  @ApiProperty({ description: 'id of user' })
  id: string;
}

export class CheckLinkResponseDto {
  @ApiProperty()
  @IsString()
  fullName: string;
}

export class GetAllUsers {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  generation: number;

  @ApiProperty()
  role: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isCheckin: boolean;

  @ApiProperty()
  facebook: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  isAccessImage: boolean;
}

export class findAllUsersResponse {
  @ApiProperty({ description: 'List of all users', type: [GetAllUsers] })
  users: GetAllUsers[];

  @ApiProperty()
  count: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  page: number;
}

export class CheckinUserResponse {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  generation: number;
}

export class UpdateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  generation: number;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  facebook: string;

  @ApiProperty({ enumName: 'EUserRole', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ enumName: 'EIsCheckin', enum: ['true', 'false'] })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isCheckin: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateUserResponse {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  generation: number;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enumName: 'EUserRole', enum: Role })
  role: Role;

  @ApiProperty({ enumName: 'EIsCheckin', enum: ['true', 'false'] })
  isCheckin: boolean;

  @ApiProperty()
  facebook: string;

  @ApiProperty()
  image: string;
}
