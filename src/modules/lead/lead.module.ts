import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from 'common/configs/config.service';
import { ConfigModule } from 'src/common/configs/config.module';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'X-Api-Key': configService.get('QOBRIX_API_KEY'),
          'X-Api-User': configService.get('QOBRIX_API_USER'),
        },
      }),
    }),
  ],
  controllers: [LeadController],
  providers: [LeadService, ConfigService],
})
export class LeadModule {}
