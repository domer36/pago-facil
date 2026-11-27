import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import type { DashboardMetrics } from '../domain/dashboard.js';
import {
  DashboardDateValidationError,
  DashboardService,
} from '../application/dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('metrics')
  async metrics(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<DashboardMetrics> {
    try {
      return await this.service.findMetrics(from, to);
    } catch (error) {
      if (error instanceof DashboardDateValidationError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'No fue posible consultar las métricas del dashboard.',
      );
    }
  }
}
