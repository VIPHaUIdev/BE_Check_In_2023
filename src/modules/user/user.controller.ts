import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseMessage } from 'src/decorators/response.decorator';
import {
  CreateUserDto,
  FindOnePayload,
  UserDto,
  ValidateGetAllUsersDto,
  ValidateUserDto,
} from './dto/user.dto';
import { Admin } from 'src/decorators/auth.decorator';
import { ValidateQuery } from './dto/query.dto';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  @Admin()
  @ResponseMessage('success')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id') id: string): Promise<FindOnePayload> {
    const user = await this.userService.findOne(id);
    delete user.password;
    return user;
  }

  @Get()
  // @Admin()
  @ResponseMessage('get all users successfully')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: ValidateQuery,
  ): Promise<ValidateGetAllUsersDto[]> {
    const users = await this.userService.findAll(query);
    return users;
  }

  @Post()
  @Admin()
  @ResponseMessage('create success')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUser: CreateUserDto): Promise<UserDto> {
    const user = await this.userService.create(createUser);
    delete user.password;
    return user;
  }

  @Post('/signup')
  @ResponseMessage('signup successfully')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() userDto: ValidateUserDto): Promise<UserDto> {
    const user = await this.userService.signup(userDto);
    delete user.password;
    return user;
  }
}
