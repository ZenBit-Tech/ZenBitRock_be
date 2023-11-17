import { Test } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/modules/user/user.service';
import { ConfigService } from 'src/common/configs/config.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

describe('EmailController', () => {
  let emailController: EmailController;
  let emailService: EmailService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [EmailService, { provide: UserService, useValue: { findByEmail: jest.fn(), updateById: jest.fn() } }, ConfigService, { provide: MailerService, useValue: { sendMail: jest.fn() } }],
    }).compile();

    emailService = moduleRef.get(EmailService);
    emailController = moduleRef.get(EmailController);
  });

  describe('sendEmailVerificationCode', () => {
    it('should send email verification code', async () => {
      const result = ['test'];
      const email = 'test@gmail.com';
      jest.spyOn(emailService, 'sendEmailVerificationCode').mockResolvedValueOnce(result);

      expect(await emailController.sendEmailVerificationCode({ email })).toBe(result);
    });
  });
});
