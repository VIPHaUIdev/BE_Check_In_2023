import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Version } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO, CreateUserDTO } from './dto/user.dto';
import { Response } from 'src/common/dto/response';
import { ResponseMessage } from 'src/decorators/response.decorator';

@Controller({
  path: "users",
  version: "1"
})
export class UserController {
  constructor(
    private userService: UserService,
  ) {}

  @Get(':id')
  @ResponseMessage('success')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string): Promise<UserDTO>{
    return this.userService.findOne(id)
  }

  @Post()
  @ResponseMessage('create success')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreateUserDTO): Promise<UserDTO>{
    const user = await this.userService.create(createPostDto);
    delete user.password;
    return user
  }
}
