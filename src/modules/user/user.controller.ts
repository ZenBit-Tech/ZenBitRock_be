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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import {
  UserAuthResponse,
  UserInfoResponse,
  UserSetAvatarResponse,
} from 'src/common/types';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteAvatarDto } from './dto/delete-avatar.dto';
import { SetAvatarDto } from './dto/set-avatar.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserNotificationsDto } from './dto/update-notifications.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Endpoint to register a new user',
    description:
      'New user registration by providing email and password in the request body.',
  })
  @ApiResponse({ status: 200, description: 'Successful registration' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateUserDto })
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
      return await this.userService.deleteAccount(id);
    } catch (error) {
      throw error;
    }
  }

  @Patch('/update')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Updating user data' })
  @ApiResponse({ status: 202, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UsePipes(new ValidationPipe())
  async updateUser(@Body() userData: UpdateUserDto): Promise<UserInfoResponse> {
    try {
      return await this.userService.updateUserData(userData);
    } catch (error) {
      throw error;
    }
  }

  @Patch('/update-notifications')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user notifications preference' })
  @ApiResponse({ status: 202, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UsePipes(new ValidationPipe())
  async updateNotifications(
    @Body() notificationsData: UpdateUserNotificationsDto,
  ): Promise<UpdateResult> {
    try {
      const { userId, receiveNotifications } = notificationsData;

      return await this.userService.updateById(userId, {
        receiveNotifications,
      });
    } catch (error) {
      throw error;
    }
  }

  @Patch('/set-avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Setting user avatar' })
  @ApiResponse({ status: 202, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 })],
      }),
    )
    file: Express.Multer.File,
    @Body() data: SetAvatarDto,
  ): Promise<UserSetAvatarResponse> {
    try {
      return await this.userService.setAvatar(file, data);
    } catch (error) {
      throw error;
    }
  }

  @Patch('/delete-avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Deleting user avatar' })
  @ApiResponse({ status: 202, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UsePipes(new ValidationPipe())
  async deleteAvatar(@Body() data: DeleteAvatarDto): Promise<void> {
    try {
      await this.userService.deleteUserAvatar(data);
    } catch (error) {
      throw error;
    }
  }
}
