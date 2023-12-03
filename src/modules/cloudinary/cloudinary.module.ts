import { Module } from '@nestjs/common';

import { ConfigModule } from 'common/configs/config.module';

import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryService],
  controllers: [CloudinaryController],
})

export class CloudinaryModule { }
