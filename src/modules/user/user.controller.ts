import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseMessage } from 'src/decorators/response.decorator';
import { CreateUserDto, FindOnePayload, UserDto } from './dto/user.dto';
import { Admin } from 'src/decorators/auth.decorator';

@Controller({
  path: 'users',
  version: '1',
})
@Admin()
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  @ResponseMessage('success')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id') id: string): Promise<FindOnePayload> {
    const user = await this.userService.findOne(id);
    delete user.password;
    return user;
  }

  @Post()
  @ResponseMessage('create success')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUser: CreateUserDto): Promise<UserDto> {
    const user = await this.userService.create(createUser);
    delete user.password;
    return user;
  }
}
