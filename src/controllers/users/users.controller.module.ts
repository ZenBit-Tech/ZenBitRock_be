import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersControllerService } from './users.controller.service';
import { UsersModule } from 'src/services/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [UsersController],
  providers: [UsersControllerService],
})
export class UsersControllerModule {}
