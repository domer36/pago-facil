import { Module } from '@nestjs/common';
import { DashboardModule } from './features/dashboard/dashboard.module.js';

@Module({
  imports: [DashboardModule],
})
export class AppModule {}
