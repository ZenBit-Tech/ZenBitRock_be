import { Inject, Injectable, NestMiddleware, forwardRef } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MAX_RETRIES, RETRY_DELAY } from 'src/common/constants';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class DatabasePingMiddleware implements NestMiddleware {
  constructor(
    @Inject(forwardRef(() => UserService))
    private UserService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    let attemptCount = 0;
    let isRetrySuccessful = false;

    while (attemptCount < MAX_RETRIES && !isRetrySuccessful) {
      try {
        await this.UserService.findOne('ping');
        isRetrySuccessful = true;
      } catch (error) {
        console.error(error);
        attemptCount++;
        await new Promise((res) => setTimeout(res, RETRY_DELAY));
      }
    }

    next();
  }
}
