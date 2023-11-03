import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /* eslint-disable class-methods-use-this */
  getHello(): string {
    return 'Hello!';
  }
}
