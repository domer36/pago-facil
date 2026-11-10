import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { QuoteRequest, QuoteResponse, QuoteType } from '../domain/quote.models';
import { CreateQuote } from '../application/create-quote.use-case';
import { DownloadQuotePdf } from '../application/download-quote-pdf.use-case';

registerLocaleData(localeEsMx);

@Component({
  imports: [CurrencyPipe, ReactiveFormsModule],
  selector: 'app-quote-page',
  styleUrl: './quote-page.component.css',
  templateUrl: './quote-page.component.html',
})
export class QuotePageComponent {
  readonly terms = [6, 12, 18, 24, 36, 48];
  readonly form = new FormGroup({
    type: new FormControl<QuoteType>('credito-simple', { nonNullable: true }),
    totalValue: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    downPaymentPercentage: new FormControl<number | null>(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(80),
    ]),
    termMonths: new FormControl<number>(6, { nonNullable: true }),
    residualPercentage: new FormControl<number | null>(null),
  });

  readonly quote = signal<QuoteResponse | null>(null);
  readonly errorMessage = signal('');
  readonly downloadErrorMessage = signal('');
  readonly isSubmitting = signal(false);
  readonly isDownloadingPdf = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly createQuote: CreateQuote,
    private readonly downloadQuotePdf: DownloadQuotePdf,
  ) {
    this.form.controls.type.valueChanges.pipe(takeUntilDestroyed()).subscribe((type) => {
      const residualControl = this.form.controls.residualPercentage;
      if (type === 'arrendamiento') {
        residualControl.setValidators([Validators.required, Validators.min(0), Validators.max(80)]);
      } else {
        residualControl.clearValidators();
        residualControl.setValue(null);
      }
      residualControl.updateValueAndValidity({ emitEvent: false });
      this.quote.set(null);
      this.errorMessage.set('');
      this.downloadErrorMessage.set('');
    });
  }

  submit(): void {
    this.quote.set(null);
    this.errorMessage.set('');
    this.downloadErrorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completa los campos obligatorios con valores válidos.');
      return;
    }

    const { type, totalValue, downPaymentPercentage, termMonths, residualPercentage } =
      this.form.getRawValue();

    if (typeof totalValue !== 'number' || typeof downPaymentPercentage !== 'number') {
      this.errorMessage.set('Completa los campos obligatorios con valores válidos.');
      return;
    }

    const request: QuoteRequest = {
      type,
      totalValue,
      downPaymentPercentage,
      termMonths,
    };

    if (type === 'arrendamiento') {
      if (typeof residualPercentage !== 'number') {
        this.errorMessage.set('Completa los campos obligatorios con valores válidos.');
        return;
      }
      request.residualPercentage = residualPercentage;
    }

    this.isSubmitting.set(true);
    this.createQuote.execute(request).subscribe({
      next: (quote) => {
        this.quote.set(quote);
        this.isSubmitting.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getErrorMessage(error));
        this.isSubmitting.set(false);
      },
    });
  }

  downloadPdf(): void {
    const quote = this.quote();
    if (!quote || this.isDownloadingPdf()) {
      return;
    }

    this.downloadErrorMessage.set('');
    this.isDownloadingPdf.set(true);
    this.downloadQuotePdf
      .execute(quote)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pdf) => {
          try {
            startPdfDownload(pdf);
          } catch {
            this.downloadErrorMessage.set(this.getDownloadErrorMessage());
          } finally {
            this.isDownloadingPdf.set(false);
          }
        },
        error: () => {
          this.downloadErrorMessage.set(this.getDownloadErrorMessage());
          this.isDownloadingPdf.set(false);
        },
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'No fue posible generar la cotización. Intenta de nuevo.';
  }

  private getDownloadErrorMessage(): string {
    return 'No fue posible descargar el PDF de la cotización. Intenta de nuevo.';
  }
}

function startPdfDownload(pdf: Blob): void {
  const url = URL.createObjectURL(pdf);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cotizacion.pdf';
  try {
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
