import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UpdateResult } from 'typeorm';

import * as argon2 from 'argon2';

import { User } from 'src/common/entities/user.entity';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.userService.findOne(email);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const passwordIsMatch = await argon2.verify(user.password, password);

      if (user && passwordIsMatch) {
        return user;
      }

      throw new BadRequestException('Email or password are incorrect');
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }

  async login(
    user: Pick<User, 'id' | 'email'>,
  ): Promise<{ id: string; email: string; token: string }> {
    try {
      const { id, email } = user;
      return {
        id,
        email,
        token: this.jwtService.sign({ id: user.id, email: user.email }),
      };
    } catch (error) {
      throw new BadRequestException('Login failed');
    }
  }

  async confirmEmail(email: string, code: string): Promise<UpdateResult> {
    const user: User = await this.userService.findByEmail(email);

    if (!user) throw new BadRequestException("User doesn't exist!");

    if (user.isVerified)
      throw new ForbiddenException('Email already activated');

    if (code !== user.verificationCode)
      throw new ForbiddenException('Incorrect verifictaion code!');

    return await this.userService.updateById(user.id, { isVerified: true });
  }

  async resetPassword(
    email: string,
    password: string,
    code: string,
  ): Promise<UpdateResult> {
    try {
      const user = await this.userService.findByEmail(email);

      if (!user || code !== user.verificationCode) {
        throw new BadRequestException('Invalid code');
      }
      const hashedPassword = await argon2.hash(password);
      return await this.userService.updateByEmail(email, {
        password: hashedPassword,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
