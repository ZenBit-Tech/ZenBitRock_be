import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from 'src/common/entities/user.entity';
import { UserInfoResponse } from 'src/common/types';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(user: User): Promise<UserInfoResponse> {
    try {
      const userDetails = await this.userService.findOne(user.email);

      return {
        email: userDetails.email,
        id: userDetails.id,
        isVerified: userDetails.isVerified,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        role: userDetails.role,
        city: userDetails.city,
        country: userDetails.country,
        phone: userDetails.phone,
        qobrixContactId: userDetails.qobrixContactId,
        qobrixAgentId: userDetails.qobrixAgentId,
        qobrixUserId: userDetails.qobrixUserId,
        agencyName: userDetails.agencyName,
        description: userDetails.description,
        avatarUrl: userDetails.avatarUrl,
        avatarPublicId: userDetails.avatarPublicId,
        isDeleted: userDetails.isDeleted,
        receiveNotifications: userDetails.receiveNotifications,
      };
    } catch (error) {
      if (error) {
        throw error;
      }
      throw new UnauthorizedException(`JWT validation failed`);
    }
  }
}
