import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserDTO>{
    throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Some error description' })

  }
}
