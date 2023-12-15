import { lastValueFrom } from 'rxjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { QobrixApiPath } from 'src/common/enums';
import { getPropertySearchFilter } from './lib/helpers';
import {
  Lead,
  LeadDetailsResponse,
  MatchingPropertiesResponse,
} from 'src/common/types';

@Injectable()
export class LeadService {
  constructor(private httpService: HttpService) {}

  async getLeadDetails(id: string): Promise<LeadDetailsResponse> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.get<LeadDetailsResponse>(
          `${process.env.QOBRIX_BASE_URL}${QobrixApiPath.OPPORTUNITIES}/${id}`,
          {
            params: {
              ['include[]']: 'ConversionStatusWorkflowStages',
            },
          },
        ),
      );

      if (!data) {
        throw new NotFoundException('Not found');
      }

      const lead = data.data;
      const matchingProperties = await this.getMatchingProperties(lead);

      return { data: lead, matchingProperties: matchingProperties.data };
    } catch (error) {
      throw error;
    }
  }

  async getMatchingProperties(lead: Lead): Promise<MatchingPropertiesResponse> {
    const filter = getPropertySearchFilter(lead);

    try {
      const { data } = await lastValueFrom(
        this.httpService.get<MatchingPropertiesResponse>(
          `${process.env.QOBRIX_BASE_URL}${QobrixApiPath.PROPERTIES}`,
          {
            params: {
              search: filter,
            },
          },
        ),
      );

      if (!data) {
        throw new NotFoundException('Not found');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }
}
