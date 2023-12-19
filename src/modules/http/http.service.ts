import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from 'common/configs/config.service';

@Injectable()
export class HTTPService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async deleteAgentFromCRM(userId: string): Promise<void> {
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    const url = `${baseUrl}/agents/${userId}`;

    try {
      await lastValueFrom(this.httpService.delete(url));
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Deleting agent from CRM failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteContactFromCRM(userId: string): Promise<void> {
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    const url = `${baseUrl}/contacts/${userId}`;
    try {
      await lastValueFrom(this.httpService.delete(url));
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Deleting contact from CRM failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
