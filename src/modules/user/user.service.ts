import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as argon2 from 'argon2';
import { Repository, UpdateResult } from 'typeorm';

import { CloudinaryService } from 'modules/cloudinary/cloudinary.service';
import { User } from 'src/common/entities/user.entity';
import { UserAuthResponse } from 'src/common/types';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserAuthResponse> {
    try {
      const existUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

      if (existUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const user = await this.userRepository.save({
        email: createUserDto.email,
        password: await argon2.hash(createUserDto.password),
      });

      const token = this.jwtService.sign({ email: createUserDto.email });
      return {
        user: { email: user.email, id: user.id, isVerified: user.isVerified },
        token,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          `Error creating user: ${error.message}`,
        );
      }
    }
  }

  async findOne(email: string): Promise<User> {
    try {
      return await this.userRepository.findOne({
        where: {
          email,
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
        },
      });
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
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
      return await this.userRepository.update({ email }, data);
    } catch (error) {
      throw new Error('Failed to update user by email');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deletedUser = await this.userRepository.delete({ id });

      if (!deletedUser.affected) throw new NotFoundException('Not found');

      throw new HttpException('User deleted successfully', HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  async updateUserData(userData: UpdateUserDto): Promise<void> {
    try {
      const { userId, ...updatedFields } = userData;
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.userRepository.update(userId, updatedFields);

      throw new HttpException('Updated', HttpStatus.ACCEPTED);
    } catch (error) {
      throw error;
    }
  }

  async setAvatar(
    file: Express.Multer.File,
    data: { userId: string },
  ): Promise<string> {
    const { userId } = data;

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const avatarUrl = await this.cloudinaryService.upload(file);
      if (!avatarUrl) {
        throw new BadRequestException(
          'Error uploading the file to the server. Try again',
        );
      }

      await this.userRepository.update(userId, { avatarUrl });
      throw new HttpException('Updated', HttpStatus.ACCEPTED);
    } catch (error) {
      throw error;
    }
  }
}
