import { Injectable } from '@nestjs/common';
import type { DocumentGenerator } from '../domain/document-generator.js';
import type { QuoteDocument } from '../domain/quote-document.js';

@Injectable()
export class QuotePdfGenerator implements DocumentGenerator<QuoteDocument> {
  generate(quote: QuoteDocument): Uint8Array {
    const lines = [
      'Cotizacion de financiamiento',
      `Tipo: ${quote.type}`,
      `Valor total MXN: ${quote.totalValue}`,
      `Enganche MXN: ${quote.downPayment}`,
      `Monto financiado MXN: ${quote.financedAmount}`,
      `Plazo meses: ${quote.termMonths}`,
      `Total pagado MXN: ${quote.totalPaid}`,
      `Intereses MXN: ${quote.totalInterest}`,
      ...(quote.residualPayment === null
        ? []
        : [`Residual MXN: ${quote.residualPayment}`]),
    ];
    const content = lines
      .map(
        (line, index) =>
          `BT /F1 12 Tf 50 ${790 - index * 24} Td (${escapePdfText(line)}) Tj ET`,
      )
      .join('\n');

    return Buffer.from(createPdf(content), 'ascii');
  }
}

function escapePdfText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

function createPdf(content: string): string {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'ascii')} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}
