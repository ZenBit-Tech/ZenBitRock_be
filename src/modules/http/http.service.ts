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

  async checkAgentExistsInCRM(agentId: string): Promise<boolean> {
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    const url = `${baseUrl}/agents/${agentId}`;
    try {
      await lastValueFrom(this.httpService.get(url));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async checkContactExistsInCRM(contactId: string): Promise<boolean> {
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    const url = `${baseUrl}/contacts/${contactId}`;
    try {
      await lastValueFrom(this.httpService.get(url));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async checkUserExistsInCRM(userId: string): Promise<boolean> {
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    const url = `${baseUrl}/users/${userId}`;
    try {
      await lastValueFrom(this.httpService.get(url));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async deleteAgentFromCRM(userId: string): Promise<void> {
    const agentExists = await this.checkAgentExistsInCRM(userId);
    if (!agentExists) {
      return;
    }
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
    const contactExists = await this.checkContactExistsInCRM(userId);
    if (!contactExists) {
      return;
    }
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

  async deleteUserFromCRM(userId: string): Promise<void> {
    const userExists = await this.checkUserExistsInCRM(userId);
    if (!userExists) {
      return;
    }
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    const url = `${baseUrl}/users/${userId}`;
    try {
      await lastValueFrom(this.httpService.delete(url));
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Deleting user from CRM failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllOpportunities(association: string, id: string): Promise<any[]> {
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    const url = `${baseUrl}/opportunities/related-with/${association}/${id}`;
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve opportunities',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteOpportunity(opportunityId: string): Promise<void> {
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    const url = `${baseUrl}/opportunities/${opportunityId}`;
    try {
      await lastValueFrom(this.httpService.delete(url));
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Deleting opportunity failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAllOpportunities(association: string, id: string): Promise<void> {
    try {
      const opportunities = await this.getAllOpportunities(association, id);
      if (opportunities.length === 0) {
        return;
      }
      const deletePromises = opportunities.map((opportunity) =>
        this.deleteOpportunity(opportunity.id),
      );
      await Promise.all(deletePromises);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error deleting opportunities: ' + error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
