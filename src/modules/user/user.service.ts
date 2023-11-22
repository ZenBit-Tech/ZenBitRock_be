import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as argon2 from 'argon2';
import { Repository, UpdateResult } from 'typeorm';

import { User } from 'src/common/entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
    try {
      const existUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

      if (existUser) {
        throw new BadRequestException('This email already exists');
      }

      const user = await this.userRepository.save({
        email: createUserDto.email,
        password: await argon2.hash(createUserDto.password),
      });

      const token = this.jwtService.sign({ email: createUserDto.email });
      return { user, token };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
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
        relations: ['verificationData'],
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
    return await this.userRepository.update(id, data);
  }

  async updateByEmail(email: string, data: Partial<User>): Promise<UpdateResult> {
    try {
      return await this.userRepository.update(email, data);
    } catch (error) {
      throw new Error('Failed to update user by email');
    }
  }
}
