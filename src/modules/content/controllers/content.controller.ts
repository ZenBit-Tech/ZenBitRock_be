import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Content } from 'src/common/entities/content.entity';
import { ContentResponse } from 'src/common/types/content/content.type';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

import { ChangeStatusContentDto } from '../dto/content-status.dto';
import { UpdateContentDto } from '../dto/content.dto';
import { ContentService } from '../services/content.service';

@Controller('content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('/')
  @ApiOperation({ summary: 'Getting all content' })
  @ApiResponse({ status: 200, description: 'OK', type: Content, isArray: true })
  @ApiResponse({ status: 404, description: 'Not found' })
  getAllContent(): Promise<ContentResponse[]> {
    return this.contentService.getAllContent();
  }

  @Patch('/:id/change-status')
  @ApiOperation({ summary: 'Updating content status' })
  @ApiResponse({ status: 202, description: 'Updated', type: Content })
  @ApiResponse({ status: 400, description: 'Bad request' })
  changeStatusContentById(
    @Param('id') contentId: string,
    @Request() req: { user: { id: string } },
    @Body() changeStatusDto: ChangeStatusContentDto,
  ): Promise<ContentResponse> {
    return this.contentService.changeStatusContentById(
      contentId,
      req.user.id,
      changeStatusDto,
    );
  }

  @Post('/add-one')
  @HttpCode(202)
  @ApiOperation({ summary: 'Adding content data' })
  @ApiResponse({ status: 202, description: 'Added' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  updateContent(
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<{ message: string }> {
    return this.contentService
      .updateContent(updateContentDto)
      .then(() => ({ message: 'Content added successfully' }));
  }
}
