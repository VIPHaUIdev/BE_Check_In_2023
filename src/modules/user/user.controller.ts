import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { ResponseMessage } from 'src/decorators/response.decorator';
import {
  CreateUserDto,
  UserDto,
  InfoUserDto,
  findAllUsersResponse,
  CheckinUserResponse,
  UpdateUserDto,
  UpdateUserResponse,
  FindOnePayload,
} from './dto/user.dto';
import { Admin } from 'src/decorators/auth.decorator';
import { QueryDto } from './dto/query.dto';
import { SseService } from '../../shared/services/sse.service';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    private userService: UserService,
    private sseService: SseService,
  ) {}

  @Get(':id')
  @Admin()
  @ResponseMessage('success')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id') id: string): Promise<FindOnePayload | null> {
    const user = await this.userService.findOne(id);
    delete user.password;
    return user;
  }

  @Get()
  @Admin()
  @ResponseMessage('get all users successfully')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryDto): Promise<findAllUsersResponse> {
    const data = await this.userService.findAll(query);
    return data;
  }

  @Patch('/checkin/:id')
  @Admin()
  @ResponseMessage('checkin successfully')
  @HttpCode(HttpStatus.OK)
  async checkIn(@Param('id') id: string): Promise<CheckinUserResponse> {
    const updatedUser = await this.userService.checkin(id);
    return updatedUser;
  }

  @Patch(':id')
  @Admin()
  @ResponseMessage('update user successfully')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    const updatedUser = await this.userService.updateUser(id, data);
    return updatedUser;
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
  async signup(@Body() userDto: InfoUserDto): Promise<UserDto> {
    const user = await this.userService.signup(userDto);
    delete user.password;
    return user;
  }

  @Get('/sse/realtime')
  async streamCheckinData(@Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sseObservable = this.sseService.getObservable();
    const onData = async (userId: string) => {
      const checkinUsers = await this.userService.findOne(userId);
      delete checkinUsers.password;
      res.write(`data: ${JSON.stringify(checkinUsers)}\n\n`);
    };
    sseObservable.subscribe((userId: string) => {
      onData(userId);
    });

    res.on('close', () => {
      this.sseService.unsubscribe();
    });
  }
}
