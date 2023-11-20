import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service';
import { User } from 'src/common/entities/user.entity';
import { UpdateResult } from 'typeorm';

jest.mock('../user/user.service');
jest.mock('@nestjs/jwt');
jest.mock('argon2');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should validate user', async () => {
      const email = 'test@example.com';
      const password = 'padffeefe123';

      const user = new User();

      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true);

      await expect(authService.validateUser(email, password)).resolves.toEqual(
        user,
      );
    });
  });

  describe('login', () => {
    it('should generate a token and return user email', async () => {
      const user: Partial<User> = {
        id: '1qwer',
        email: 'test@example.com',
        password: 'hashedpassword',
      };

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('generatedToken');

      const result = await authService.login({
        id: user.id,
        email: user.email,
      });

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        token: 'generatedToken',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const email = 'test@example.com';
      const password = 'newpassword';
      const verificationCode = '123456';
      const user: Partial<User> = {
        email,
        password,
        verificationCode,
      };
      jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValueOnce(user as User);
      jest.spyOn(argon2, 'hash').mockResolvedValueOnce('hashedPassword');
      jest
        .spyOn(userService, 'updateByEmail')
        .mockResolvedValueOnce({} as UpdateResult);

      await expect(
        authService.resetPassword(email, password, verificationCode),
      ).resolves.toEqual({});

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(argon2.hash).toHaveBeenCalledWith(password);
      expect(userService.updateByEmail).toHaveBeenCalledWith(email, {
        password: 'hashedPassword',
      });
    });
  });
});
