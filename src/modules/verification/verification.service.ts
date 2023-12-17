import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from 'common/entities/user.entity';
import { CloudinaryService } from 'modules/cloudinary/cloudinary.service';

import { CreateVerificationDto } from './dto/create-verification.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async updateUserVerificationData(
    file: Express.Multer.File,
    { userId, ...verificationData }: CreateVerificationDto,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const upoadedFileData = await this.cloudinaryService.upload(file);
      if (!upoadedFileData) {
        throw new BadRequestException('Error uploading the file to the server');
      }

      const { fileUrl: userDocumentUrl, filePublicId: userDocumentPublicId } =
        upoadedFileData;
      const updatedUser = {
        ...verificationData,
        userDocumentUrl,
        userDocumentPublicId,
      };

      await this.userRepository.update(userId, updatedUser);
      throw new HttpException('Updated', HttpStatus.ACCEPTED);
    } catch (error) {
      throw error;
    }
  }
}
