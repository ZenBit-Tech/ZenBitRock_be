import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service';
import { User } from 'src/common/entities/user.entity';

jest.mock('../user/user.service');
jest.mock('@nestjs/jwt');
jest.mock('argon2');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        JwtService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should validate user', async () => {
      const email = 'test@example.com';
      const password = 'padffeefe123';
      const user: User = { id: '1qwer', email, password: await argon2.hash(password) };

      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true);

      await expect(authService.validateUser(email, password)).resolves.toEqual(user);
    });

  });

  describe('login', () => {
    it('should generate a token and return user email', async () => {
      const user: User = { id: '1qwer', email: 'test@example.com', password: 'hashedpassword' };

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('generatedToken');

      const result = await authService.login(user);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        token: 'generatedToken',
      });
    });

  });
});