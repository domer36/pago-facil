import { Body, Controller, Post } from '@nestjs/common';
import type { QuoteResponse } from './quote.dto.js';
import { QuoteService } from './quote.service.js';

@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  create(@Body() request: unknown): QuoteResponse {
    return this.quoteService.calculate(request);
  }
}
