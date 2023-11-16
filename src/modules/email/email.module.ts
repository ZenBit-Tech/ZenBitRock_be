import { forwardRef, Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ConfigModule } from 'src/common/configs/config.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [ConfigModule, forwardRef(() => UserModule)],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
