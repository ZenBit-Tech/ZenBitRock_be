import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from 'common/configs/config.service';
import { AgentResponse } from 'src/common/types/user/agent-response.type';
import { UserProfileResponse } from 'src/common/types';
import { UserService } from '../user/user.service';

@Injectable()
export class HTTPService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
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
    if (!userId) {
      return;
    }

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
    if (!userId) {
      return;
    }
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
    if (!userId) {
      return;
    }
    const userExists = await this.checkUserExistsInCRM(userId);
    if (!userExists) {
      return;
    }
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    const url = `${baseUrl}/users/${userId}?trashed=true`;
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
    if (!id) {
      return;
    }
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
      if (!opportunityId) {
        return;
      }
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
      if (!id) {
        return;
      }

      const opportunities = await this.getAllOpportunities(association, id);
      if (opportunities.length === 0) {
        return;
      }
      const deletePromises = opportunities.map((opportunity) => {
        this.deleteOpportunity(opportunity.id);
      });

      await Promise.allSettled(deletePromises);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Error deleting opportunities: ${id}` + error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAgentById(id: string): Promise<AgentResponse> {
    const baseUrl = this.configService.get('QOBRIX_PROXY_URL');
    if (!id) {
      return;
    }
    const url = `${baseUrl}/agents/${id}`;
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve agent',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserDataFromCrm(
    userId: string,
    qobrixAgentId: string,
  ): Promise<UserProfileResponse> {
    const crmResponse = await this.getAgentById(qobrixAgentId);
    if (!crmResponse) {
      return null;
    }

    const updateData = {
      firstName: crmResponse.primary_contact_contact.first_name,
      lastName: crmResponse.primary_contact_contact.last_name,
      nationality: crmResponse.primary_contact_contact.nationality,
      contactEmail: crmResponse.primary_contact_contact.email,
      phone: crmResponse.primary_contact_contact.phone,
      street: crmResponse.primary_contact_contact.street,
      city: crmResponse.primary_contact_contact.city,
      state: crmResponse.primary_contact_contact.state,
      zip: crmResponse.primary_contact_contact.post_code,
      country: crmResponse.primary_contact_contact.country,
      dateOfBirth: crmResponse.primary_contact_contact.birthdate,
      role: crmResponse.agent_type,
      description: crmResponse.description,
    };

    await this.userService.updateById(userId, updateData);
    return this.userService.findOneById(userId);
  }
}
