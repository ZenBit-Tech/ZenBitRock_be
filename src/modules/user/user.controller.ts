import { Controller, Post, Get, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { User } from 'src/common/entities/user.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiOperation({ summary: 'Endpoint to register a new user', description: 'New user registration by providing email and password in the request body.' })
  @ApiResponse({ status: 200, description: 'Successful registration' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
    return this.userService.create(createUserDto);
  }

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Getting all users' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getAllUsers(): Promise<User[]> {
    try {
      const data = await this.userService.getAll();
      return data;
    } catch (error) {
      throw error;
    }
  }

  @Post('/id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Getting user by id' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getUserByUd(@Body() body: { id: string }): Promise<User> {
    try {
      const user = await this.userService.findOneById(body.id);
      return user;
    } catch (error) {
      throw error;
    }
  }
}
