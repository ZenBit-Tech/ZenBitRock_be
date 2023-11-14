import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { User } from 'src/common/entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Endpoint to register a new user', description: 'New user registration by providing email and password in the request body.' })
  @ApiResponse({ status: 200, description: 'Successful registration' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
    return this.userService.create(createUserDto);
  }
}
