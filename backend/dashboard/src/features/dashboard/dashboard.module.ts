import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { DashboardService } from './application/dashboard.service.js';
import { DASHBOARD_REPOSITORY } from './application/dashboard.repository.js';
import { PostgresDashboardRepository } from './infrastructure/postgres-dashboard.repository.js';
import { DashboardController } from './presentation/dashboard.controller.js';

const poolProvider = {
  provide: Pool,
  useFactory: (): Pool => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('La variable de entorno DATABASE_URL es obligatoria.');
    }
    return new Pool({ connectionString });
  },
};

@Module({
  controllers: [DashboardController],
  providers: [
    poolProvider,
    PostgresDashboardRepository,
    {
      provide: DASHBOARD_REPOSITORY,
      useExisting: PostgresDashboardRepository,
    },
    DashboardService,
  ],
})
export class DashboardModule {}
