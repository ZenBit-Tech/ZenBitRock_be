import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Repository } from 'typeorm';

import { ConfigService } from 'common/configs/config.service';
import { User } from 'common/entities/user.entity';

import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpoadFileDto } from './dto/upload-file.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => ConfigService))
    private readonly config: ConfigService,
  ) { }

  private readonly s3Client = new S3Client({
    region: this.config.get('AWS_S3_REGION'),
    credentials:
    {
      accessKeyId: this.config.get('AWS_ACCESS_KEY'),
      secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
    },
  });

  async updateUserVerificationData(
    originalName: string,
    file: Buffer,
    { userId, ...verificationData }: CreateVerificationDto,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const fileData = await this.awsUpload(originalName, file);
      if (!fileData) {
        throw new BadRequestException('Error uploading the file to the server. Try again');
      }
      const { fileName, fileUrl } = fileData;
      const updatedUser = { ...verificationData, fileName, fileUrl };

      await this.userRepository.update(userId, updatedUser);
      throw new HttpException('Updated', HttpStatus.ACCEPTED);
    } catch (error) {
      throw error;
    }
  }

  async awsUpload(fileName: string, file: Buffer): Promise<UpoadFileDto | null> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'zenbitrock1',
          Key: fileName,
          Body: file,
        }),
      );
      const params = {
        Bucket: 'zenbitrock1',
        Key: fileName,
      };
      const ONE_WEEK_IN_SECONDS = 604800;
      const command = new GetObjectCommand(params);
      const fileUrl = await getSignedUrl(
        this.s3Client, command, { expiresIn: ONE_WEEK_IN_SECONDS });
      return { fileName, fileUrl };
    } catch (error) {
      return null;
    }
  }
}
