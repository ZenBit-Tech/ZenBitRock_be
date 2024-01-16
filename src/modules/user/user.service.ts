import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as argon2 from 'argon2';
import { Repository, UpdateResult } from 'typeorm';

import { CloudinaryService } from 'modules/cloudinary/cloudinary.service';
import { User } from 'src/common/entities/user.entity';
import {
  UserAuthResponse,
  UserInfoResponse,
  UserSetAvatarResponse,
} from 'src/common/types';
import { Chat } from 'src/common/entities/chat.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteAvatarDto } from './dto/delete-avatar.dto';
import { SetAvatarDto } from './dto/set-avatar.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HTTPService } from '../http/http.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
    private httpService: HTTPService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserAuthResponse> {
    try {
    
      const existingUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
          isDeleted: false,
        },
      });

      if (existingUser) {
        throw new BadRequestException('This email already exists');
      }


      const user = await this.userRepository.save({
        email: createUserDto.email,
        password: await argon2.hash(createUserDto.password),
        isDeleted: false,
      });

      const token = this.jwtService.sign({ email: createUserDto.email });
      return {
        user: {
          email: user.email,
          id: user.id,
          isVerified: user.isVerified,
          isDeleted: user.isDeleted,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(email: string): Promise<User> {
    try {
      return await this.userRepository.findOne({
        where: {
          email,
          isDeleted: false,
        },
      });
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException('Not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<User[] | []> {
    try {
      const data = await this.userRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });
      if (!data) {
        throw new NotFoundException('Not found');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOne({
        where: {
          email,
          isDeleted: false,
        },
      });
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  async findAllByEmail(email: string): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: {
          email,
        },
      });
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  async findLatestActiveUserByEmail(email: string): Promise<User> {
    try {
      const users = await this.userRepository.find({
        where: { email },
        order: { createdAt: 'DESC' },
      });

      const activeUser = users.find((user) => !user.isDeleted);
      if (!activeUser) {
        throw new Error('Active user not found');
      }
      return activeUser;
    } catch (error) {
      throw new Error(`Error finding active user: ${error.message}`);
    }
  }

  async updateById(id: string, data: Partial<User>): Promise<UpdateResult> {
    try {
      return await this.userRepository.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  async updateByEmail(
    email: string,
    data: Partial<User>,
  ): Promise<UpdateResult> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: email,
          isDeleted: false,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      if (!user) {
        throw new Error('User not found');
      }
      
      return await this.userRepository.update({ id: user.id }, data);
    } catch (error) {
      throw new Error('Failed to update user by email');
    }
  }

  async delete(id: string): Promise<void> {
    try {

      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.userRepository.update(id, { isDeleted: true });

      throw new HttpException('User deleted successfully', HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
        },
      });

      console.log(user);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { qobrixAgentId, qobrixContactId } = user;
      await this.httpService.deleteAllOpportunities(
        'ContactNameContacts',
        qobrixContactId,
      );
      await this.httpService.deleteAgentFromCRM(qobrixAgentId);
      await this.httpService.deleteContactFromCRM(qobrixContactId);
      await this.userRepository.update(id, { isDeleted: true });

      throw new HttpException('User deleted successfully', HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  async updateUserData(userData: UpdateUserDto): Promise<UserInfoResponse> {
    try {
      const { userId, ...updatedFields } = userData;
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.userRepository.update(userId, updatedFields);

      return await this.userRepository.findOne({ where: { id: userId } });
    } catch (error) {
      throw error;
    }
  }

  async setAvatar(
    file: Express.Multer.File,
    data: SetAvatarDto,
  ): Promise<UserSetAvatarResponse> {
    const { userId, avatarPublicId: oldAvatarPublicId } = data;

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (oldAvatarPublicId)
        await this.cloudinaryService.deleteImage(oldAvatarPublicId);

      const upoadedAvatarData = await this.cloudinaryService.upload(file);
      if (!upoadedAvatarData) {
        throw new BadRequestException('Error uploading the file to the server');
      }

      const { fileUrl: avatarUrl, filePublicId: avatarPublicId } =
        upoadedAvatarData;
      await this.userRepository.update(userId, { avatarUrl, avatarPublicId });

      return { avatarUrl, avatarPublicId };
    } catch (error) {
      throw error;
    }
  }

  async deleteUserAvatar(data: DeleteAvatarDto): Promise<void> {
    const { userId, avatarPublicId: avatarId } = data;

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) throw new NotFoundException('User not found');

      await this.cloudinaryService.deleteImage(avatarId);

      const avatarUrl = null;
      const avatarPublicId = null;
      await this.userRepository.update(userId, { avatarUrl, avatarPublicId });

      throw new HttpException('Updated', HttpStatus.ACCEPTED);
    } catch (error) {
      throw error;
    }
  }

  async getChatsByUser(id: string): Promise<Chat[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: { joinedChats: true },
      });

      return user.joinedChats;
    } catch (error) {
      throw error;
    }
  }
}
