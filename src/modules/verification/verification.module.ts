import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from 'common/configs/config.module';
import { User } from 'common/entities/user.entity';
import { VerificationEntity } from 'common/entities/verification.entity';

import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationEntity, User]),
    ConfigModule,
  ThrottlerModule.forRoot([{
    ttl: 60000,
    limit: 333,
  }])],
  controllers: [VerificationController],
  providers: [VerificationService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
  ],
})
export class VerificationModule { }
