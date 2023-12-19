import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import {
  LeadDetailsResponse,
  MatchingPropertiesResponse,
} from 'src/common/types';
import { LeadService } from './lead.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lead')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get('details/:id')
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
  @Get('properties')
  @ApiOperation({ summary: 'Getting matching properties' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getMatchingProperties(
    @Query('search') search: string,
    @Query('page') page: number,
  ): Promise<MatchingPropertiesResponse> {
    try {
      return await this.leadService.getMatchingProperties(search, page);
    } catch (error) {
      throw error;
    }
  }
}
