import { Inject, Injectable, NestMiddleware, forwardRef } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class DatabasePingMiddleware implements NestMiddleware {
  constructor(
    @Inject(forwardRef(() => UserService))
    private UserService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      await this.UserService.findOne('ping');
    } catch (error) {
      console.error(error);
    }

    next();
  }
}
