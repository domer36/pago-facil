import { Module } from '@nestjs/common';
import { QuoteService } from './application/quote.service.js';
import { QuoteController } from './presentation/quote.controller.js';

@Module({
  controllers: [QuoteController],
  providers: [QuoteService],
})
export class QuotesModule {}
