import {
  BadRequestException,
  Body,
  Controller,
  Header,
  Post,
  StreamableFile,
} from '@nestjs/common';
import {
  QuoteDocumentService,
  QuoteDocumentValidationError,
} from '../application/quote-document.service.js';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly quoteDocumentService: QuoteDocumentService) {}

  @Post('quote')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="cotizacion.pdf"')
  generateQuote(@Body() quote: unknown): StreamableFile {
    try {
      return new StreamableFile(this.quoteDocumentService.generate(quote));
    } catch (error) {
      if (error instanceof QuoteDocumentValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
