import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { ProspectService } from './application/prospect.service.js';
import { PROSPECT_REPOSITORY } from './application/prospect.repository.js';
import { PostgresProspectRepository } from './infrastructure/postgres-prospect.repository.js';
import { ProspectController } from './presentation/prospect.controller.js';

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
  controllers: [ProspectController],
  providers: [
    poolProvider,
    PostgresProspectRepository,
    {
      provide: PROSPECT_REPOSITORY,
      useExisting: PostgresProspectRepository,
    },
    ProspectService,
  ],
})
export class CustomersModule {}
