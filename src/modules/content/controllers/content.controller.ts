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
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Content } from 'src/common/entities/content.entity';
import { ContentResponse } from 'src/common/types/content/content.type';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

import { ChangeStatusContentDto } from '../dto/content-status.dto';
import { ContentDto } from '../dto/content.dto';
import { ContentService } from '../services/content.service';
import { UpdateContentDto } from '../dto/content-update.dto';

@Controller('content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('/')
  @ApiOperation({ summary: 'Getting all content' })
  @ApiResponse({ status: 200, description: 'OK', type: Content, isArray: true })
  @ApiResponse({ status: 404, description: 'Not found' })
  getAllContent(
    @Request() req: { user: { id: string } },
  ): Promise<ContentResponse[]> {
    return this.contentService.getAllContent(req.user.id);
  }

  @Patch('/:id/change-status')
  @ApiOperation({ summary: 'Updating content status' })
  @ApiResponse({ status: 202, description: 'Status updated', type: Content })
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
  async addContent(
    @Body() AddContentDto: ContentDto,
  ): Promise<ContentResponse> {
    try {
      return await this.contentService.addContent(AddContentDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a content' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  deleteChat(@Param('id') id: string): Promise<void> {
    return this.contentService.deleteContent(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updating content data' })
  @ApiResponse({ status: 202, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateContent(
    @Param('id') contentId: string,
    @Request() req: { user: { id: string } },
    @Body() contentData: UpdateContentDto,
  ): Promise<ContentResponse> {
    try {
      return await this.contentService.updateContent(
        contentId,
        req.user.id,
        contentData,
      );
    } catch (error) {
      throw error;
    }
  }
}
