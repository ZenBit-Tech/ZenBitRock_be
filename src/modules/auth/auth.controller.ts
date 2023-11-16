import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { User } from 'src/common/entities/user.entity';

import { CreateUserDto } from '../user/dto/create-user.dto';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { UpdateResult } from 'typeorm';

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
  @ApiResponse({ status: 200, description: 'Successfully retrieved user profile', type: CreateUserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<User> {
    return req.user;
  }

  @Post('confirm-email')
  @ApiOperation({ summary: 'Confirm email address' })
  @ApiResponse({ status: 200, description: 'Email address successfully confirmed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto): Promise<UpdateResult> {
    const { code, email } = confirmEmailDto;
    return this.authService.confirmEmail(email, code);
  }
}
