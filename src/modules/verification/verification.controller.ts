import { Controller, Body, UsePipes, ValidationPipe, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, Patch, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateVerificationDto } from './dto/create-verification.dto';
import { VerificationService } from './verification.service';

@ApiBearerAuth()
@ApiTags('User`s verification data')
@UseGuards(JwtAuthGuard)
@Controller('/verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) { }

  @ApiOperation({ summary: 'Updating user verification data' })
  @ApiResponse({ status: 202, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch('/update')
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
      await this.verificationService.updateUserVerificationData(
        file.originalname, file.buffer, verificationData);
    } catch (error) {
      throw error;
    }
  }
}
