import { Module } from '@nestjs/common';
import {
  QUOTE_PDF_GENERATOR,
  QuoteDocumentService,
} from './application/quote-document.service.js';
import { QuotePdfGenerator } from './infrastructure/quote-pdf.generator.js';
import { DocumentsController } from './presentation/documents.controller.js';

@Module({
  controllers: [DocumentsController],
  providers: [
    QuoteDocumentService,
    QuotePdfGenerator,
    {
      provide: QUOTE_PDF_GENERATOR,
      useExisting: QuotePdfGenerator,
    },
  ],
})
export class DocumentsModule {}
