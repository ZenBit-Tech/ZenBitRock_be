/* eslint-disable class-methods-use-this */
import { Injectable, BadRequestException } from '@nestjs/common';

import * as cloudinary from 'cloudinary';

import { ConfigService } from 'common/configs/config.service';

import { UploadedFileDto } from './dto/uploaded-file.dto';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.v2.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async upload(file: Express.Multer.File): Promise<UploadedFileDto> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: 'ZenBitRock' },
        (error, result) => {
          if (error) {
            reject(new BadRequestException('Failed to upload file to Cloudinary'));
          } else {
            const { secure_url: fileUrl, public_id: filePublicId } = result;
            resolve({ fileUrl, filePublicId });
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<{ result: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.destroy(publicId, (error, { result }) => {
        if (error) {
          reject(new BadRequestException('Failed to delete file from Cloudinary'));
        } else {
          resolve({ result });
        }
      });
    });
  }
}
