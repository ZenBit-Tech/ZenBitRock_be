import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ConfigModule } from 'common/configs/config.module';
import { ConfigService } from 'common/configs/config.service';
import { CloudinaryService } from 'modules/cloudinary/cloudinary.service';
import { User } from 'src/common/entities/user.entity';
import { Chat } from 'src/common/entities/chat.entity';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HTTPService } from '../http/http.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Chat]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService, CloudinaryService, ConfigService, HTTPService],
  exports: [UserService],
})
export class UserModule {}
