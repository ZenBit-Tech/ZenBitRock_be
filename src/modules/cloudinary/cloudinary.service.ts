import { Injectable, BadRequestException } from '@nestjs/common';

import * as cloudinary from 'cloudinary';

import { ConfigService } from 'common/configs/config.service';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.v2.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async upload(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: 'ZenBitRock' },
        (error, result) => {
          if (error) {
            reject(new BadRequestException('Failed to upload file to Cloudinary'));
          } else {
            resolve(result.secure_url);
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
