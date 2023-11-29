import { forwardRef, Module } from '@nestjs/common';

import { ConfigModule } from 'src/common/configs/config.module';
import { UserModule } from 'src/modules/user/user.module';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule, forwardRef(() => UserModule)],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
