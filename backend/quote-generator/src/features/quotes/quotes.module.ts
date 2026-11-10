import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { QUOTE_REPOSITORY } from './application/quote.repository.js';
import { QuoteService } from './application/quote.service.js';
import { SaveQuoteService } from './application/save-quote.service.js';
import { PostgresQuoteRepository } from './infrastructure/postgres-quote.repository.js';
import { QuoteController } from './presentation/quote.controller.js';

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
  controllers: [QuoteController],
  providers: [
    poolProvider,
    PostgresQuoteRepository,
    {
      provide: QUOTE_REPOSITORY,
      useExisting: PostgresQuoteRepository,
    },
    QuoteService,
    SaveQuoteService,
  ],
})
export class QuotesModule {}
