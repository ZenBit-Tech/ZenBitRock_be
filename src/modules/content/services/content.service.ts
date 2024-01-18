import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Content } from 'src/common/entities/content.entity';
import { ContentStatus } from 'src/common/entities/contentStatus.entity';
import { User } from 'src/common/entities/user.entity';

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

  async getAllContent(): Promise<Content[]> {
    return this.contentRepository.find();
  }

  async changeStatusContentById(
    contentId: string,
    userId: string,
    changeStatusDto: ChangeStatusContentDto,
  ): Promise<Content> {
    try {
      const content = await this.contentRepository
        .createQueryBuilder('content')
        .leftJoinAndSelect('content.contentStatus', 'contentStatus')
        .where('content.id = :id', { id: contentId })
        .getOneOrFail();

      if (!content) {
        throw new NotFoundException('Content not found');
      }

      const { contentStatus } = content;
      const userContentStatus =
        Array.isArray(contentStatus) &&
        contentStatus.find((status) => status.user.id === userId);

      if (!userContentStatus) {
        throw new UnauthorizedException(
          'User does not have access to change status for this content',
        );
      }

      userContentStatus.checked = changeStatusDto.checked;

      return await this.contentRepository.save(content);
    } catch (error) {
      throw error;
    }
  }

  async updateContent(
    userId: string,
    updateContentDto: UpdateContentDto,
  ): Promise<void> {
    try {
      await this.contentRepository.delete({ user: { id: userId } });
      const user = { id: userId } as User;
      const contents = updateContentDto.contents.map((content) => ({
        ...content,
        user,
      }));
      await this.contentRepository.save(contents);
    } catch (error) {
      throw error;
    }
  }
}
