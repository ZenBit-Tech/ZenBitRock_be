import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Content } from 'src/common/entities/content.entity';
import { ContentStatus } from 'src/common/entities/contentStatus.entity';
import { User } from 'src/common/entities/user.entity';
import { ContentResponse } from 'src/common/types/content/content.type';

import { ChangeStatusContentDto } from '../dto/content-status.dto';
import { UpdateContentDto } from '../dto/content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(ContentStatus)
    private readonly contentStatusRepository: Repository<ContentStatus>,
  ) {}

  async getAllContent(userId: string): Promise<ContentResponse[]> {
    try {
      const contents: Content[] = await this.contentRepository.find({
        relations: ['contentStatuses'],
      });

      const response: ContentResponse[] = contents.map((content) => ({
        id: content.id,
        createdAt: content.createdAt,
        title: content.title,
        link: content.link,
        type: content.type,
        screenshot: content.screenshot,
        checked:
          content.contentStatuses.length > 0 &&
          content.contentStatuses.filter(
            (contentStatus) => contentStatus.user.id === userId,
          ).length > 0
            ? content.contentStatuses.filter(
                (contentStatus) => contentStatus.user.id === userId,
              )[0].checked
            : false,
      }));

      return response;
    } catch (error) {
      throw error;
    }
  }

  async changeStatusContentById(
    contentId: string,
    userId: string,
    changeStatusDto: ChangeStatusContentDto,
  ): Promise<ContentResponse> {
    try {
      const content = await this.contentRepository.findOneOrFail({
        where: { id: contentId },
        relations: ['contentStatuses'],
      });

      if (!content) {
        throw new NotFoundException('Content not found');
      }
      let userContentStatus = await this.contentStatusRepository.findOne({
        where: { content: { id: contentId }, user: { id: userId } },
        relations: ['content', 'user'],
      });
      if (!userContentStatus) {
        userContentStatus = new ContentStatus();
        userContentStatus.content = content;
        userContentStatus.user = { id: userId } as User;
      }

      userContentStatus.checked = changeStatusDto.checked;
      await this.contentStatusRepository.save(userContentStatus);

      const updatedContent = await this.contentRepository.findOneOrFail({
        where: { id: contentId },
        relations: ['contentStatuses'],
      });

      return {
        id: updatedContent.id,
        createdAt: updatedContent.createdAt,
        title: updatedContent.title,
        link: updatedContent.link,
        type: updatedContent.type,
        screenshot: updatedContent.screenshot,
        checked:
          updatedContent.contentStatuses.length > 0 &&
          updatedContent.contentStatuses[0].checked,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateContent(contentDto: UpdateContentDto): Promise<void> {
    try {
      const content = new Content();
      content.title = contentDto.title;
      content.link = contentDto.link;
      content.screenshot = contentDto.screenshot;
      content.type = contentDto.type;

      await this.contentRepository.save(content);
    } catch (error) {
      throw error;
    }
  }
}
