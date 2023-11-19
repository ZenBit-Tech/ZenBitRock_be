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

// eslint-disable-next-line import/no-extraneous-dependencies
import { PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { S3 } from 'aws-sdk'
import { Repository } from 'typeorm';

import { ConfigService } from 'common/configs/config.service';
import { User } from 'common/entities/user.entity';
import { VerificationEntity } from 'common/entities/verification.entity';
import { VerificationFileEntity } from 'src/common/entities/verification-file.entity';

import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpoadFileDto } from './dto/upload-file.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationEntity)
    private readonly verificationRepository: Repository<VerificationEntity>,
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

  async create(
    fileName: string,
    file: Buffer,
    verificationData: CreateVerificationDto,
  ): Promise<void> {
    try {
      const {
        firstName,
        lastName,
        role,
        gender,
        dateOfBirth,
        nationality,
        identity,
        status,
        street,
        city,
        state,
        zip,
        country,
        phone,
        userId,
      } = verificationData;

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Not found');
      }
      if (user.verificationData) {
        throw new BadRequestException('Verification data already exist');
      }

      const fileData = await this.awsUpload(fileName, file);
      if (!fileData) {
        throw new BadRequestException('Error uploading the file to the server. Try again.');
      }
      const verification = new VerificationEntity();
      verification.firstName = firstName;
      verification.lastName = lastName;
      verification.role = role;
      verification.gender = gender;
      verification.dateOfBirth = dateOfBirth;
      verification.nationality = nationality;
      verification.identity = identity;
      verification.status = status;
      verification.street = street;
      verification.city = city;
      verification.state = state;
      verification.zip = zip;
      verification.country = country;
      verification.phone = phone;
      verification.user = user;

      const verificationFileEntity = new VerificationFileEntity();
      verificationFileEntity.fileName = fileData.fileName;
      verificationFileEntity.fileUrl = fileData.fileUrl;
      verification.files = [verificationFileEntity];

      await this.verificationRepository.save(verification);
      throw new HttpException('Created', HttpStatus.CREATED);
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<object> {
    try {
      const data = await this.verificationRepository.find();
      if (!data) {
        throw new NotFoundException('Not found');
      }
      return data;
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
