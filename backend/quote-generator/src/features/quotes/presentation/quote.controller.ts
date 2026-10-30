import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import type { QuoteResponse } from '../domain/quote.js';
import {
  QuoteService,
  QuoteValidationError,
} from '../application/quote.service.js';

@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  create(@Body() request: unknown): QuoteResponse {
    try {
      return this.quoteService.calculate(request);
    } catch (error) {
      if (error instanceof QuoteValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
