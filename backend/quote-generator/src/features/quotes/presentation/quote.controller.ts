import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common';
import type { QuoteResponse } from '../domain/quote.js';
import type { SavedQuote } from '../domain/saved-quote.js';
import {
  QuoteService,
  QuoteValidationError,
} from '../application/quote.service.js';
import {
  ProspectNotFoundError,
  SaveQuoteService,
} from '../application/save-quote.service.js';

@Controller('quotes')
export class QuoteController {
  constructor(
    private readonly quoteService: QuoteService,
    private readonly saveQuoteService: SaveQuoteService,
  ) {}

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

  @Post('saved')
  async save(@Body() request: unknown): Promise<SavedQuote> {
    try {
      return await this.saveQuoteService.save(request);
    } catch (error) {
      if (error instanceof QuoteValidationError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof ProspectNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
