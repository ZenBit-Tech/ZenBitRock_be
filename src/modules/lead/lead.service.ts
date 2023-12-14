import { lastValueFrom } from 'rxjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { QobrixApiPath } from 'src/common/enums';
import { LeadDetailsResponse } from 'src/common/types/lead';

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
      return data;
    } catch (error) {
      throw error;
    }
  }
}
