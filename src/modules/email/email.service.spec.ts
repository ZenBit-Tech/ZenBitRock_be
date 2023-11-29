import { Test } from '@nestjs/testing';

import { MailerService } from '@nestjs-modules/mailer';

import { ConfigService } from 'src/common/configs/config.service';
import { User } from 'src/common/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';

import { EmailService } from './email.service';

describe('EmailService', () => {
  let mailerService: MailerService;
  let userService: UserService;
  let emailService: EmailService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: UserService,
          useValue: { findByEmail: jest.fn(), updateById: jest.fn() },
        },
        ConfigService,
        { provide: MailerService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();

    userService = moduleRef.get(UserService);
    mailerService = moduleRef.get(MailerService);
    emailService = moduleRef.get(EmailService);
  });

  describe('sendEmailVerificationCode', () => {
    it('should send email verification code', async () => {
      const result = ['test'];
      const email = 'test@gmail.com';
      jest.spyOn(mailerService, 'sendMail').mockResolvedValueOnce(result);
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(new User());

      expect(await emailService.sendEmailVerificationCode(email)).toBe(result);
    });
  });
});
