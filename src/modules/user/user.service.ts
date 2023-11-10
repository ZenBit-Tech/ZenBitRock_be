import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as argon2 from 'argon2';
import { Repository } from 'typeorm';

import { User } from 'src/common/entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

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
}
