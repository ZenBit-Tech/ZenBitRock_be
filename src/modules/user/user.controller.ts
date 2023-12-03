import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Patch,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { User } from 'src/common/entities/user.entity';
import { UserAuthResponse } from 'src/common/types';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiOperation({
    summary: 'Endpoint to register a new user',
    description:
      'New user registration by providing email and password in the request body.',
  })
  @ApiResponse({ status: 200, description: 'Successful registration' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto): Promise<UserAuthResponse> {
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
      return await this.userService.getAll();
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
      return await this.userService.findOneById(body.id);
    } catch (error) {
      throw error;
    }
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async deleteUserByUd(@Query('id') id: string): Promise<void> {
    try {
      return await this.userService.delete(id);
    } catch (error) {
      throw error;
    }
  }

  @Patch('/update')
  @ApiOperation({ summary: 'Updating user data' })
  @ApiResponse({ status: 202, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UsePipes(new ValidationPipe())
  async updateUser(@Body() userData: UpdateUserDto): Promise<void> {
    try {
      await this.userService.updateUserData(userData);
    } catch (error) {
      throw error;
    }
  }
}
