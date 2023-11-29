import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
  HttpException,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { UpdateResult } from 'typeorm';

import { User } from 'src/common/entities/user.entity';

import { CreateUserDto } from '../user/dto/create-user.dto';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Endpoint to sign in user with email and password' })
  @ApiBody({ type: AuthDto })
  @UseGuards(LocalAuthGuard)
  login(@Request() req): Promise<{ id: string; email: string; token: string }> {
    return this.authService.login(req.user);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user profile',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<User> {
    return req.user;
  }

  @Post('confirm-email')
  @ApiOperation({ summary: 'Confirm email address' })
  @ApiResponse({
    status: 200,
    description: 'Email address successfully confirmed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
  ): Promise<UpdateResult> {
    try {
      const { code, email } = confirmEmailDto;
      return await this.authService.confirmEmail(email, code);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Unable to confirm email!',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('restore-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: 200,
    description: 'Password restored successfully',
    type: UpdateResult,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: RestorePasswordDto })
  async restorePassword(
    @Body() restorePasswordDto: RestorePasswordDto,
  ): Promise<UpdateResult> {
    try {
      return await this.authService.resetPassword(
        restorePasswordDto.email,
        restorePasswordDto.password,
        restorePasswordDto.code,
      );
    } catch (error) {
      throw new BadRequestException(
        `Password restoration failed: ${error.message}`,
      );
    }
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: UpdateResult,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: ChangePasswordDto })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req,
  ): Promise<UpdateResult> {
    try {
      const userEmail = req.user.email;
      return await this.authService.changePassword(
        userEmail,
        changePasswordDto.oldPassword,
        changePasswordDto.newPassword,
      );
    } catch (error) {
      throw new BadRequestException(`Password change failed: ${error.message}`);
    }
  }
}
