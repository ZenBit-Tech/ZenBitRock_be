import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async createUser(createUserDto: CreateUserDto): Promise<void> {
    try {
      const email = createUserDto.email;
      const lastName = createUserDto.lastName;

      const result = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email OR user.lastName = :lastName', {
          email,
          lastName,
        })
        .getOne();

      if (result) {
        throw new BadRequestException(
          'User with this last name or email already registered',
        );
      }

      await this.userRepository
        .createQueryBuilder('user')
        .insert()
        .values(createUserDto)
        .execute();
    } catch (e) {
      throw e;
    }
  }

  public async getAllUsers(): Promise<ResponseUserDto[]> {
    try {
      return await this.userRepository.createQueryBuilder('user').getMany();
    } catch (e) {
      throw e;
    }
  }

  public async getUserById(id: string): Promise<ResponseUserDto> {
    try {
      const result = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        .getOne();

      if (!result) {
        throw new NotFoundException('User not found');
      }

      return result;
    } catch (e) {
      throw e;
    }
  }
}
