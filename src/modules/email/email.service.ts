import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from 'src/common/configs/config.service';
import { UserService } from '../user/user.service';
import { CODE_LENGTH, generateCode } from './lib';

@Injectable()
export class EmailService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => ConfigService))
    private config: ConfigService,
    private mailerService: MailerService,
  ) {}

  async sendEmailVerificationCode(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException(`User doesn't exist`);
    const code = generateCode(CODE_LENGTH);

    await this.userService.updateById(user.id, {
      isVerified: false,
      verificationCode: code,
    });

    return this.mailerService.sendMail({
      to: user.email,
      from: this.config.get('MAIL_USER'),
      subject: 'Verify your email address',
      html: `<p>Verification code: ${code}</p>`,
    });
  }

  async sendCodeForRestorePassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException(`User doesn't exist`);
    const code = generateCode(CODE_LENGTH);

    await this.userService.updateById(user.id, {
      verificationCode: code,
    });

    return this.mailerService.sendMail({
      to: user.email,
      from: this.config.get('MAIL_USER'),
      subject: 'Your code for reset password',
      html: `<p>Verification code: ${code}</p>`,
    });
  }
}
