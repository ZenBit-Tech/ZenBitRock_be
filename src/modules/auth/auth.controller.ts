import {
  Body, Controller, Get, Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getAllRegistration(): Promise<AuthDto[]> {
    return this.authService.getAllRegistration();
  }

  @Post()
  async signUp(@Body() signUpDto: AuthDto): Promise<void> {
    await this.authService.signUp(signUpDto);
  }
}
