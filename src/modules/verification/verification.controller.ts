import { Controller, Get, Post, Body, UsePipes, ValidationPipe, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateVerificationDto } from './dto/create-verification.dto';
import { VerificationService } from './verification.service';

@ApiTags('User`s verification data')
@Controller('/verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) { }

  @ApiOperation({ summary: 'Getting all verifications' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Get('/')
  async getAll(): Promise<object> {
    try {
      const data = await this.verificationService.getAll();
      return data;
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Creating verification' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/add')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5000000 }),
      ],
    }),
  ) file: Express.Multer.File, @Body() verificationData: CreateVerificationDto): Promise<void> {
    try {
      await this.verificationService.create(file.originalname, file.buffer, verificationData);
    } catch (error) {
      throw error;
    }
  }
}
