import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Content } from 'src/common/entities/content.entity';

import { ChangeStatusContentDto } from '../dto/content-status.dto';
import { UpdateContentDto } from '../dto/content.dto';
import { ContentService } from '../services/content.service';

@Controller('content')
@UseGuards(AuthGuard())
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  getAllContent(): Promise<Content[]> {
    return this.contentService.getAllContent();
  }

  @Patch('/:id/change-status')
  changeStatusContentById(
    @Param('id') contentId: string,
    @Request() req: { user: { id: string } },
    @Body() changeStatusDto: ChangeStatusContentDto,
  ): Promise<Content> {
    return this.contentService.changeStatusContentById(
      contentId,
      req.user.id,
      changeStatusDto,
    );
  }

  @Post('/update')
  updateContent(
    @Request() req: { user: { id: string } },
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<void> {
    return this.contentService.updateContent(req.user.id, updateContentDto);
  }
}
