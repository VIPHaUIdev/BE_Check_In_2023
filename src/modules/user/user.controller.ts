import {
  Body,
  Controller,
  Get,
  Header,
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
import { QueryUserDto } from './dto/query.dto';
import { SseService } from '../../shared/services/sse.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailService } from '../email/email.service';
import { GetAllJobsResponse } from '../email/dto/email.dto';
import { QueryJobDto } from '../email/dto/query.dto';
import { SignupAdminDto } from './dto/admin.dto';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    private userService: UserService,
    private sseService: SseService,
    private emailService: EmailService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  @Get()
  @Admin()
  @ResponseMessage('get all users successfully')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryUserDto): Promise<findAllUsersResponse> {
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

  @Patch('/:id')
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
  @ResponseMessage('create successfully')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUser: CreateUserDto): Promise<UserDto> {
    const user = await this.userService.create(createUser);
    delete user.password;
    return user;
  }

  @Post('/signup/admin')
  @ResponseMessage('sign up admin successfully')
  @HttpCode(HttpStatus.CREATED)
  async signupAdmin(@Body() adminBody: SignupAdminDto): Promise<UserDto> {
    const admin = await this.userService.signupAdmin(adminBody);
    delete admin.password;
    return admin;
  }

  @Post('/signup')
  @ResponseMessage('signup successfully')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() userDto: InfoUserDto): Promise<UserDto> {
    const user = await this.userService.signup(userDto);
    delete user.password;

    await this.emailQueue.add('sendEmail', {
      email: user.email,
      userId: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
    });

    return user;
  }

  @Get('/sse')
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

  @Get('/export-excel')
  @Admin()
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header(
    'Content-Disposition',
    'attachment; filename="Danh-sach-dang-ky.xlsx"',
  )
  async exportUsers(@Res() res: Response): Promise<void> {
    const buffer = await this.userService.exportUsersToExcel();
    res.send(buffer);
  }

  @Get('/email-jobs')
  @Admin()
  @ResponseMessage('get all email jobs successfully')
  @HttpCode(HttpStatus.OK)
  async getAllEmailJobs(
    @Query() query: QueryJobDto,
  ): Promise<GetAllJobsResponse> {
    const data = await this.emailService.getJobs(query);
    return data;
  }

  @Get('/:id')
  @Admin()
  @ResponseMessage('success')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id') id: string): Promise<FindOnePayload | null> {
    const user = await this.userService.findOne(id);
    delete user.password;
    return user;
  }
}
