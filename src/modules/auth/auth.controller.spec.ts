import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';


jest.mock('./auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should call AuthService.login and return the result', async () => {
      const user = { id: '1', email: 'test@example.com', token: 'generatedToken' };
      jest.spyOn(authService, 'login').mockResolvedValueOnce(user);

      const result = await authController.login({ user });

      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('getProfile', () => {
    it('should return user from request object', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const req = { user };

      const result = await authController.getProfile(req);

      expect(result).toEqual(user);
    });
  });

  
});