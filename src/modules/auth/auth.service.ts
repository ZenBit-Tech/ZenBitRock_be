import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from 'src/common/entities/auth.entity';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  public async signUp(signUpDto: AuthDto): Promise<void> {
    const { email } = signUpDto;
    const { name } = signUpDto;

    const result = await this.authRepository
      .createQueryBuilder('auth')
      .where('auth.email = :email OR auth.name = :name', {
        email,
        name,
      })
      .getOne();

    if (result) {
      throw new BadRequestException(
        'User with this name or email already registered',
      );
    }

    await this.authRepository
      .createQueryBuilder('auth')
      .insert()
      .values(signUpDto)
      .execute();
  }

  public async getAllRegistration(): Promise<AuthDto[]> {
    const result = await this.authRepository
      .createQueryBuilder('auth')
      .getMany();
    return result;
  }
}
