import { Controller, Get, UseGuards, Param } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeadDetailsResponse } from 'src/common/types/lead';
import { LeadService } from './lead.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get('details/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Getting lead details by id' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getUserByUd(@Param('id') id: string): Promise<LeadDetailsResponse> {
    try {
      return await this.leadService.getLeadDetails(id);
    } catch (error) {
      throw error;
    }
  }
}
