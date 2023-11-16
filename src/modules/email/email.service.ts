import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
import { ConfigService } from 'src/common/configs/config.service';
import { UserService } from '../user/user.service';
import { generateCode } from './lib';

@Injectable()
export class EmailService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => ConfigService))
    private config: ConfigService,
    private mailerService: MailerService,
  ) {}

  async sendEmailVerificationCode(email: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    console.log(user);

    if (!user) throw new UnauthorizedException(`User doesn't exist`);
    const code = generateCode(6);

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
}
