import { Module } from '@nestjs/common';

import { ConfigModule } from 'common/configs/config.module';

import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryService],
})

export class CloudinaryModule { }
