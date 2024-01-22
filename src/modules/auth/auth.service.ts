import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as argon2 from 'argon2';
import { UpdateResult } from 'typeorm';
import { UserProfileResponse, UserSignInResponse } from 'src/common/types';
import { User } from 'src/common/entities/user.entity';

import { UserService } from '../user/user.service';
import { HTTPService } from '../http/http.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private httpService: HTTPService,
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

  async login(user: User): Promise<UserSignInResponse> {
    try {
      if (user.qobrixContactId || user.qobrixAgentId || user.qobrixUserId) {
        const contactExists = await this.httpService.checkContactExistsInCRM(
          user.qobrixContactId,
        );
        const agentExists = await this.httpService.checkAgentExistsInCRM(
          user.qobrixAgentId,
        );
        const userExists = await this.httpService.checkUserExistsInCRM(
          user.qobrixUserId,
        );

        if (!contactExists || !agentExists || !userExists) {
          await this.userService.deleteAccount(user.id);
        }
      }

      return {
        user: {
          email: user.email,
          id: user.id,
          isVerified: user.isVerified,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          city: user.city,
          country: user.country,
          phone: user.phone,
          qobrixContactId: user.qobrixContactId,
          qobrixAgentId: user.qobrixAgentId,
          qobrixUserId: user.qobrixUserId,
          agencyName: user.agencyName,
          description: user.description,
          avatarUrl: user.avatarUrl,
          avatarPublicId: user.avatarPublicId,
          isDeleted: user.isDeleted,
          receiveNotifications: user.receiveNotifications,
        },

        token: this.jwtService.sign({ id: user.id, email: user.email }),
      };
    } catch (error) {
      throw new BadRequestException('Login failed');
    }
  }

  async confirmEmail(
    email: string,
    code: string,
  ): Promise<UserProfileResponse> {
    const user: User = await this.userService.findByEmail(email);
    try {
      if (!user) throw new BadRequestException("User doesn't exist!");

      if (code !== user.verificationCode)
        throw new ForbiddenException('Incorrect verification code!');

      if (user.isVerified)
        throw new ConflictException('Email already activated');

      await this.userService.updateById(user.id, { isVerified: true });

      return await this.userService.findByEmail(email);
    } catch (error) {
      throw error;
    }
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
  async verifyOldPassword(
    email: string,
    oldPassword: string,
  ): Promise<boolean> {
    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return argon2.verify(user.password, oldPassword);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<UpdateResult> {
    try {
      const isOldPasswordValid = await this.verifyOldPassword(
        email,
        oldPassword,
      );

      if (!isOldPasswordValid) {
        throw new UnauthorizedException('Invalid old password');
      }

      const newPasswordHash = await argon2.hash(newPassword);
      return await this.userService.updateByEmail(email, {
        password: newPasswordHash,
      });
    } catch (error) {
      throw new BadRequestException(`Password change failed: ${error.message}`);
    }
  }
}
