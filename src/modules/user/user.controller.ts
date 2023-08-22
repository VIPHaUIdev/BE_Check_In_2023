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
  Req,
  Res,
  Request,
  Headers,
  UploadedFile,
  Headers,
  Request,
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
import { Admin, Auth } from 'src/decorators/auth.decorator';
import { QueryUserDto } from './dto/query.dto';
import { SseService } from '../../shared/services/sse.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailService } from '../email/email.service';
import { GetAllJobsResponse } from '../email/dto/email.dto';
import { QueryJobDto } from '../email/dto/query.dto';
import { FileUpload } from 'src/decorators/file-upload.decorator';

@SkipThrottle()
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

  @Patch('/checkin')
  @Admin()
  @ResponseMessage('checkin by email or phone successfully')
  @HttpCode(HttpStatus.OK)
  async checkInByEmailPhone(
    @Query('q') account: string,
  ): Promise<CheckinUserResponse> {
    const updatedUser = await this.userService.checkin(account, 'email-phone');
    return updatedUser;
  }

  @Patch('/checkin/:id')
  @Admin()
  @ResponseMessage('checkin successfully')
  @HttpCode(HttpStatus.OK)
  async checkIn(@Param('id') id: string): Promise<CheckinUserResponse> {
    const updatedUser = await this.userService.checkin(id);
    return updatedUser;
  }

  @Post('/signup')
  @SkipThrottle(false)
  @Recaptcha()
  @ResponseMessage('signup successfully')
  @HttpCode(HttpStatus.OK)
  @FileUpload('image')
  async signup(
    @Body() userDto: InfoUserDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<UserDto> {
    userDto.image = image ? image.filename : null;
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
  @SkipThrottle(false)
  @ResponseMessage('sign up admin successfully')
  @HttpCode(HttpStatus.CREATED)
  async signupAdmin(
    @Body() adminBody: CreateUserDto,
    @Query('secret') code: string,
  ): Promise<UserDto> {
    const admin = await this.userService.signupAdmin(adminBody, code);
    delete admin.password;
    return admin;
  }

  @Get('/sse')
  @Admin()
  async streamCheckinData(@Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sseObservable = this.sseService.getObservable();
    const onData = async (userId: string) => {
      const checkinUsers = await this.userService.findOneById(userId);
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

  @Get('/generate-link')
  @Admin()
  @ResponseMessage('generate link successfully')
  @HttpCode(HttpStatus.OK)
  async generateLink(@Query('q') userId: string): Promise<string> {
    const token = await this.userService.generateToken(userId);
    return token;
  }

  @Get('/renew-qr')
  @SkipThrottle(false)
  @Recaptcha()
  @ResponseMessage('renew QR code successfully')
  @HttpCode(HttpStatus.OK)
  async renewQR(@Query('q') account: string): Promise<string | null> {
    const user = await this.userService.findOne(account);
    return user.id;
  }

  @Get('/check-link')
  @SkipThrottle(false)
  @Auth()
  @ResponseMessage('the link is still usable')
  @HttpCode(HttpStatus.OK)
  async checkLink(
    @Req() req: Request,
    @Headers('Authorization') authorizationHeader: string,
  ): Promise<string | null> {
    const token = authorizationHeader.replace('Bearer ', '');
    const userName = await this.userService.checkLink(
      req['user'].userId,
      token,
    );
    return userName;
  }
  @Patch('/update-image')
  @Auth()
  @FileUpload('image')
  @ResponseMessage('update image successfully')
  @HttpCode(HttpStatus.OK)
  async updateImage(
    @Req() req: Request,
    @Headers('Authorization') authorizationHeader: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<string | null> {
    const token = authorizationHeader.replace('Bearer ', '');
    const messgae = await this.userService.updateImage(
      req['user'].userId,
      token,
      image?.filename,
    );
    return messgae;
  }

  @Patch('/:id')
  @Admin()
  @ResponseMessage('update user successfully')
  @HttpCode(HttpStatus.OK)
  @FileUpload('image')
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<UpdateUserResponse> {
    data.image = image ? image.filename : null;
    const updatedUser = await this.userService.updateUser(id, data);

    return updatedUser;
  }

  @Get('/:id')
  @Admin()
  @ResponseMessage('success')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id') id: string): Promise<FindOnePayload | null> {
    const user = await this.userService.findOneById(id);
    delete user.password;
    return user;
  }
}
