import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Content } from 'src/common/entities/content.entity';
import { ContentStatus } from 'src/common/entities/contentStatus.entity';

import { ContentController } from './controllers/content.controller';
import { ContentService } from './services/content.service';

@Module({
  imports: [TypeOrmModule.forFeature([Content, ContentStatus])],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
