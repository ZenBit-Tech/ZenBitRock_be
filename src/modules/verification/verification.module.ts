import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from 'common/configs/config.module';
import { User } from 'common/entities/user.entity';
import { CloudinaryService } from 'modules/cloudinary/cloudinary.service';

import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  controllers: [VerificationController],
  providers: [VerificationService, CloudinaryService],
})
export class VerificationModule {}
