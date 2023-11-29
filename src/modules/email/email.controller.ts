import {
  Body,
  Controller,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EmailRecipientDto } from './dto/email-recipient-dto';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('confirm')
  @ApiOperation({
    summary: 'Send email with a verification code to a user.',
  })
  @ApiBody({ type: EmailRecipientDto })
  async sendEmailVerificationCode(@Body() recipientData: EmailRecipientDto) {
    try {
      return await this.emailService.sendEmailVerificationCode(
        recipientData.email,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Unable to send verification code',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send verification code for restoring password' })
  @ApiBody({ type: EmailRecipientDto })
  async sendCodeForRestorePassword(@Body() recipientData: EmailRecipientDto) {
    try {
      return await this.emailService.sendCodeForRestorePassword(
        recipientData.email,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Unable to send verification code',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
