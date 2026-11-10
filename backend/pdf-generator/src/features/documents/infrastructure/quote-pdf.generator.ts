import { Injectable } from '@nestjs/common';
import type { DocumentGenerator } from '../domain/document-generator.js';
import type { QuoteDocument } from '../domain/quote-document.js';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const FIRST_PAGE_PAYMENT_CAPACITY = 25;
const CONTINUATION_PAYMENT_CAPACITY = 40;
const ROW_HEIGHT = 15;
const CURRENCY_FORMATTER = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const PERCENTAGE_FORMATTER = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const QUOTE_TYPE_LABELS: Record<QuoteDocument['type'], string> = {
  'credito-simple': 'Crédito simple',
  arrendamiento: 'Arrendamiento',
  msi: 'Meses sin intereses (MSI)',
};

@Injectable()
export class QuotePdfGenerator implements DocumentGenerator<QuoteDocument> {
  generate(quote: QuoteDocument): Uint8Array {
    const pages = buildQuotePages(quote);
    return Buffer.from(createPdf(pages), 'latin1');
  }
}

function buildQuotePages(quote: QuoteDocument): string[] {
  const firstPagePayments = quote.payments.slice(
    0,
    FIRST_PAGE_PAYMENT_CAPACITY,
  );
  const remainingPayments = quote.payments.slice(FIRST_PAGE_PAYMENT_CAPACITY);
  const paymentPages = chunkPayments(
    remainingPayments,
    CONTINUATION_PAYMENT_CAPACITY,
  );
  const pageCount = 1 + paymentPages.length;
  const issueDate = new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
  }).format(new Date());

  return [
    buildFirstPage(quote, firstPagePayments, issueDate, 1, pageCount),
    ...paymentPages.map((payments, index) =>
      buildContinuationPage(
        payments,
        issueDate,
        index + 2,
        pageCount,
      ),
    ),
  ];
}

function buildFirstPage(
  quote: QuoteDocument,
  payments: QuoteDocument['payments'],
  issueDate: string,
  pageNumber: number,
  pageCount: number,
): string {
  const commands = [
    text('Cotización de financiamiento', 50, 790, 18, true),
    text(`Fecha de generación: ${issueDate}`, 50, 770, 10),
    text('Datos de la cotización', 50, 733, 12, true),
    text(`Tipo: ${QUOTE_TYPE_LABELS[quote.type]}`, 50, 713, 10),
    text(`Valor total: ${formatMoney(quote.totalValue)}`, 50, 695, 10),
    text(`Pago inicial: ${formatMoney(quote.downPayment)}`, 50, 677, 10),
    text(`Monto financiado: ${formatMoney(quote.financedAmount)}`, 50, 659, 10),
    text(`Plazo: ${quote.termMonths} meses`, 50, 641, 10),
    text('Resumen financiero', 50, 609, 12, true),
    text(
      `Tasa anual: ${formatPercentage(quote.annualRate)}%`,
      50,
      589,
      10,
    ),
    text(
      `Tasa mensual: ${formatPercentage(quote.monthlyRate)}%`,
      50,
      571,
      10,
    ),
    text(`Total pagado: ${formatMoney(quote.totalPaid)}`, 50, 553, 10),
    text(`Total de intereses: ${formatMoney(quote.totalInterest)}`, 50, 535, 10),
  ];

  if (quote.residualPayment !== null) {
    commands.push(
      text(
        `Pago residual final, liquidado por separado: ${formatMoney(quote.residualPayment)}`,
        50,
        513,
        10,
        true,
      ),
    );
  }

  commands.push(
    text('Tabla de amortización', 50, 479, 12, true),
    ...buildPaymentTable(payments, 455),
    text(`Página ${pageNumber} de ${pageCount}`, 490, 30, 9),
  );

  return commands.join('\n');
}

function buildContinuationPage(
  payments: QuoteDocument['payments'],
  issueDate: string,
  pageNumber: number,
  pageCount: number,
): string {
  return [
    text('Tabla de amortización (continuación)', 50, 790, 16, true),
    text(`Fecha de generación: ${issueDate}`, 50, 770, 10),
    ...buildPaymentTable(payments, 744),
    text(`Página ${pageNumber} de ${pageCount}`, 490, 30, 9),
  ].join('\n');
}

function buildPaymentTable(
  payments: QuoteDocument['payments'],
  headerY: number,
): string[] {
  const columns = [
    { label: 'Mensualidad', x: 50 },
    { label: 'Pago periódico', x: 112 },
    { label: 'Capital', x: 224 },
    { label: 'Interés', x: 328 },
    { label: 'Saldo pendiente', x: 416 },
  ];
  const commands = [
    line(50, headerY + 9, 545, headerY + 9),
    ...columns.map((column) => text(column.label, column.x, headerY - 5, 8, true)),
    line(50, headerY - 10, 545, headerY - 10),
  ];

  payments.forEach((payment, index) => {
    const y = headerY - 25 - index * ROW_HEIGHT;
    commands.push(
      text(String(payment.paymentNumber), 50, y, 8),
      text(formatMoney(payment.payment), 112, y, 8),
      text(formatMoney(payment.principal), 224, y, 8),
      text(formatMoney(payment.interest), 328, y, 8),
      text(formatMoney(payment.remainingBalance), 416, y, 8),
    );
  });

  return commands;
}

function chunkPayments(
  payments: QuoteDocument['payments'],
  capacity: number,
): QuoteDocument['payments'][] {
  const chunks: QuoteDocument['payments'][] = [];

  for (let offset = 0; offset < payments.length; offset += capacity) {
    chunks.push(payments.slice(offset, offset + capacity));
  }

  return chunks;
}

function formatMoney(value: number): string {
  return `$ ${CURRENCY_FORMATTER.format(value)} MXN`;
}

function formatPercentage(value: number): string {
  return PERCENTAGE_FORMATTER.format(value * 100);
}

function text(
  value: string,
  x: number,
  y: number,
  fontSize: number,
  bold = false,
): string {
  const font = bold ? 'F2' : 'F1';
  return `BT /${font} ${fontSize} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(value)}) Tj ET`;
}

function line(x1: number, y1: number, x2: number, y2: number): string {
  return `0.5 w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function escapePdfText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r');
}

function createPdf(pages: string[]): string {
  const pageReferences = pages.map((_, index) => `${5 + index * 2} 0 R`);
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageReferences.join(' ')}] /Count ${pages.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];

  pages.forEach((content, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
      `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
    );
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}
