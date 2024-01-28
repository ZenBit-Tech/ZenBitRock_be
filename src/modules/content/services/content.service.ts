import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ChangeStatusContentDto } from 'modules/content/dto/content-status.dto';
import { UpdateContentDto } from 'modules/content/dto/content-update.dto';
import { ContentDto } from 'modules/content/dto/content.dto';
import { Content } from 'src/common/entities/content.entity';
import { ContentStatus } from 'src/common/entities/contentStatus.entity';
import { User } from 'src/common/entities/user.entity';
import { ContentResponse } from 'src/common/types/content/content.type';

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
        checked: changeStatusDto.checked,
      };
    } catch (error) {
      throw error;
    }
  }

  async addContent(addContentDto: ContentDto): Promise<ContentResponse> {
    try {
      const content = new Content();
      content.title = addContentDto.title;
      content.link = addContentDto.link;
      content.screenshot = addContentDto.screenshot;
      content.type = addContentDto.type;

      const newContent = await this.contentRepository.save(content);

      const response: ContentResponse = {
        id: newContent.id,
        createdAt: newContent.createdAt,
        title: newContent.title,
        link: newContent.link,
        type: newContent.type,
        screenshot: newContent.screenshot,
        checked: false,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteContent(id: string): Promise<void> {
    try {
      await this.contentStatusRepository.delete({ content: { id } });
      const deleteContent = await this.contentRepository.delete({
        id,
      });
      if (!deleteContent.affected) {
        throw new NotFoundException('Content not found');
      }

      throw new HttpException('Content deleted successfully', HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  async updateContent(
    contentId: string,
    userId: string,
    updateContentData: UpdateContentDto,
  ): Promise<ContentResponse> {
    try {
      const content = await this.contentRepository.findOneOrFail({
        where: { id: contentId },
        relations: ['contentStatuses'],
      });

      if (!content) {
        throw new NotFoundException('Content not found');
      }
      if (content.title) {
        content.title = updateContentData.title;
      }
      if (content.link) {
        content.link = updateContentData.link;
      }
      if (content.screenshot) {
        content.screenshot = updateContentData.screenshot;
      }
      if (content.type) {
        content.type = updateContentData.type;
      }

      const newContent = await this.contentRepository.save(content);

      const response: ContentResponse = {
        id: newContent.id,
        createdAt: newContent.createdAt,
        title: newContent.title,
        link: newContent.link,
        type: newContent.type,
        screenshot: newContent.screenshot,
        checked:
          content.contentStatuses.length > 0 &&
          content.contentStatuses.filter(
            (contentStatus) => contentStatus.user.id === userId,
          ).length > 0
            ? content.contentStatuses.filter(
                (contentStatus) => contentStatus.user.id === userId,
              )[0].checked
            : false,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }
}
