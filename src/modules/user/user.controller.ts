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
  Delete,
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
  GenerateLinkResponseDto,
  RenewQrCodeResponseDto,
  CheckLinkResponseDto,
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
import { SkipThrottle } from '@nestjs/throttler';
import { Recaptcha } from '@nestlab/google-recaptcha';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@SkipThrottle()
@Controller({
  path: 'users',
  version: '1',
})
@ApiTags('users')
export class UserController {
  constructor(
    private userService: UserService,
    private sseService: SseService,
    private emailService: EmailService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Get all users by admin' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
    type: findAllUsersResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Check-in by email or phone by admin' })
  @ApiResponse({
    status: 200,
    description: 'Check-in by email or phone',
    type: CheckinUserResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Check-in by id by admin' })
  @ApiResponse({
    status: 200,
    description: 'Check-in by id',
    type: CheckinUserResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiOperation({ summary: 'Sign up event' })
  @ApiResponse({
    status: 200,
    description: 'Sign up successfully',
    type: UserDto,
  })
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
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Create user by admin' })
  @ApiResponse({
    status: 200,
    description: 'Create user successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(@Body() createUser: CreateUserDto): Promise<UserDto> {
    const user = await this.userService.create(createUser);
    delete user.password;
    return user;
  }

  @Post('/signup/admin')
  @SkipThrottle(false)
  @ResponseMessage('sign up admin successfully')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up admin' })
  @ApiResponse({
    status: 200,
    description: 'Sign up admin successfully',
    type: UserDto,
  })
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
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Real time check-in data' })
  @ApiResponse({
    status: 200,
    description: 'Real time check-in data by admin',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async streamCheckinData(@Res() res: Response): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
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
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Export users to excel by admin' })
  @ApiResponse({
    status: 200,
    description: 'Export excel successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async exportUsers(@Res() res: Response): Promise<void> {
    const buffer = await this.userService.exportUsersToExcel();
    res.send(buffer);
  }

  @Get('/email-jobs')
  @Admin()
  @ResponseMessage('get all email jobs successfully')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Get all email jobs by admin' })
  @ApiResponse({
    status: 200,
    description: 'Get all email jobs',
    type: GetAllJobsResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Generate link to user update image by admin' })
  @ApiResponse({
    status: 200,
    description: 'Generate link successfully',
    type: GenerateLinkResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async generateLink(
    @Query('q') userId: string,
  ): Promise<GenerateLinkResponseDto> {
    const token = await this.userService.generateToken(userId);
    return { token };
  }

  @Get('/renew-qr')
  @SkipThrottle(false)
  @Recaptcha()
  @ResponseMessage('renew QR code successfully')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renew QR code' })
  @ApiResponse({
    status: 200,
    description: 'Renew QR code successfully',
    type: RenewQrCodeResponseDto,
  })
  async renewQR(@Query('q') account: string): Promise<RenewQrCodeResponseDto> {
    const user = await this.userService.findOne(account);
    return { id: user.id };
  }

  @Get('/check-link')
  @SkipThrottle(false)
  @Auth()
  @ResponseMessage('the link is still usable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Check link is still usable by user' })
  @ApiResponse({
    status: 200,
    description: 'Check link successfully',
    type: CheckLinkResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async checkLink(
    @Req() req: Request,
    @Headers('Authorization') authorizationHeader: string,
    @Query('answer') answer: boolean,
  ): Promise<CheckLinkResponseDto> {
    const token = authorizationHeader.replace('Bearer ', '');
    const checkedLink = await this.userService.checkLink(
      req['user'].userId,
      token,
      answer,
    );

    return checkedLink;
  }

  @Patch('/update-image')
  @Auth()
  @FileUpload('image')
  @ResponseMessage('update image successfully')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Update image by admin' })
  @ApiResponse({
    status: 200,
    description: 'Upload image successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateImage(
    @Req() req: Request,
    @Headers('Authorization') authorizationHeader: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<void> {
    const token = authorizationHeader.replace('Bearer ', '');
    await this.userService.updateImage(
      req['user'].userId,
      token,
      image?.filename,
    );
  }

  @Post('/browse-image')
  @Admin()
  @ResponseMessage('Browse user image successfully')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Browse image by admin' })
  @ApiResponse({
    status: 200,
    description: 'Browse image successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async browseImage(@Query('q') id: string): Promise<null> {
    const user = await this.userService.browseImage(id);
    await this.emailQueue.add('sendEmailConfirm', {
      fullName: user.fullName,
      email: user.email,
    });

    return null;
  }

  @Patch('/:id')
  @Admin()
  @ResponseMessage('update user successfully')
  @HttpCode(HttpStatus.OK)
  @FileUpload('image')
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Update user by admin' })
  @ApiResponse({
    status: 200,
    description: 'Update user successfully',
    type: UpdateUserResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<UpdateUserResponse> {
    if (image) data.image = image.filename;
    const updatedUser = await this.userService.updateUser(id, data);

    return updatedUser;
  }

  @Post('/checkin-face')
  @Admin()
  @FileUpload('image', 'checkin-face')
  @ResponseMessage('check in by face successfully')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Update user by admin' })
  @ApiResponse({
    status: 200,
    description: 'Update user successfully',
    type: UpdateUserResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async checkinByFace(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<CheckinUserResponse> {
    const updatedUser = await this.userService.checkinByFace(image.buffer);
    return updatedUser;
  }

  @Get('/:id')
  @Admin()
  @ResponseMessage('success')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Get user by admin' })
  @ApiResponse({
    status: 200,
    description: 'Get user successfully',
    type: FindOnePayload,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getOne(@Param('id') id: string): Promise<FindOnePayload | null> {
    const user = await this.userService.findOneById(id);
    delete user.password;
    return user;
  }

  @Delete('/:id')
  @Admin()
  @ResponseMessage('delete user successfully')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiOperation({ summary: 'Delete user by admin' })
  @ApiResponse({
    status: 200,
    description: 'Delete user successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteOne(@Param('id') id: string): Promise<void> {
    await this.userService.deleteOne(id);
  }
}
