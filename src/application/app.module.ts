import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from '../configs/database/typeorm-config';
import { ConfigModule } from '../configs/config.module';
import { UsersModule } from 'src/services/users/users.module';
import { UsersControllerModule } from 'src/controllers/users/users.controller.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ConfigModule,
    UsersModule,
    UsersControllerModule,
  ],
})
export class AppModule {}
