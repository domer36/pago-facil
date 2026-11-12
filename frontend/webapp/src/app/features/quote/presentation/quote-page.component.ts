import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import localeEsMx from '@angular/common/locales/es-MX';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import type {
  Prospect,
  QuoteRequest,
  QuoteResponse,
  QuoteType,
  SaveQuoteRequest,
} from '../domain/quote.models';
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
  readonly prospectSearchControl = new FormControl('', { nonNullable: true });
  readonly prospectForm = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255), Validators.email],
    }),
  });

  readonly quote = signal<QuoteResponse | null>(null);
  readonly prospects = signal<Prospect[]>([]);
  readonly selectedProspect = signal<Prospect | null>(null);
  readonly errorMessage = signal('');
  readonly prospectErrorMessage = signal('');
  readonly saveErrorMessage = signal('');
  readonly saveSuccessMessage = signal('');
  readonly downloadErrorMessage = signal('');
  readonly isSubmitting = signal(false);
  readonly isSearchingProspects = signal(false);
  readonly isCreatingProspect = signal(false);
  readonly isSavingQuote = signal(false);
  readonly isDownloadingPdf = signal(false);
  readonly isProspectModalOpen = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

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
      this.saveErrorMessage.set('');
      this.saveSuccessMessage.set('');
      this.downloadErrorMessage.set('');
    });

    this.prospectSearchControl.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed())
      .subscribe((value) => {
        const search = value.trim();
        const selected = this.selectedProspect();
        const selectionText = selected ? `${selected.fullName} (${selected.email})` : '';

        if (!search || search === selectionText) {
          if (!search) {
            this.prospects.set([]);
          }
          return;
        }

        this.searchProspects();
      });
  }

  submit(): void {
    this.quote.set(null);
    this.errorMessage.set('');
    this.saveErrorMessage.set('');
    this.saveSuccessMessage.set('');
    this.downloadErrorMessage.set('');

    const request = this.buildQuoteRequestFromForm();
    if (!request) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completa los campos obligatorios con valores válidos.');
      return;
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

  searchProspects(): void {
    const search = this.prospectSearchControl.value.trim();
    this.isSearchingProspects.set(true);
    this.prospectErrorMessage.set('');

    if (!search) {
      this.prospects.set([]);
      this.isSearchingProspects.set(false);
      return;
    }

    this.http
      .get<Prospect[]>('/customers', {
        params: { search },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (prospects) => {
          this.prospects.set(prospects.slice(0, 10));
          this.isSearchingProspects.set(false);
        },
        error: (error: unknown) => {
          this.prospects.set([]);
          this.prospectErrorMessage.set(this.getProspectErrorMessage(error));
          this.isSearchingProspects.set(false);
        },
      });
  }

  openProspectModal(): void {
    this.prospectForm.reset();
    this.prospectErrorMessage.set('');
    this.isProspectModalOpen.set(true);
  }

  closeProspectModal(): void {
    this.isProspectModalOpen.set(false);
    this.prospectForm.reset();
    this.prospectErrorMessage.set('');
  }

  selectProspect(prospect: Prospect): void {
    this.selectedProspect.set(prospect);
    this.prospectSearchControl.setValue(`${prospect.fullName} (${prospect.email})`);
    this.prospects.set([]);
    this.prospectErrorMessage.set('');
    this.saveErrorMessage.set('');
    this.saveSuccessMessage.set('');
  }

  createProspect(): void {
    if (this.prospectForm.invalid) {
      this.prospectForm.markAllAsTouched();
      this.prospectErrorMessage.set('Completa nombre, teléfono y correo para registrar el prospecto.');
      return;
    }

    const { fullName, phone, email } = this.prospectForm.getRawValue();
    this.isCreatingProspect.set(true);
    this.prospectErrorMessage.set('');

    this.http
      .post<Prospect>('/customers', { fullName, phone, email })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (prospect) => {
          this.selectedProspect.set(prospect);
          this.prospects.set([prospect]);
          this.prospectSearchControl.setValue(`${prospect.fullName} (${prospect.email})`);
          this.prospectForm.reset();
          this.isCreatingProspect.set(false);
          this.isProspectModalOpen.set(false);
        },
        error: (error: unknown) => {
          this.prospectErrorMessage.set(this.getProspectErrorMessage(error));
          this.isCreatingProspect.set(false);
        },
      });
  }

  saveQuote(): void {
    const quote = this.quote();
    const prospect = this.selectedProspect();
    if (!quote) {
      this.saveErrorMessage.set('Primero genera la cotización antes de guardarla.');
      return;
    }

    if (!prospect) {
      this.saveErrorMessage.set('Selecciona un prospecto activo antes de guardar la cotización.');
      return;
    }

    const request = this.buildQuoteRequestFromForm();
    if (!request) {
      this.saveErrorMessage.set('Completa los campos obligatorios con valores válidos.');
      return;
    }

    this.isSavingQuote.set(true);
    this.saveErrorMessage.set('');
    this.saveSuccessMessage.set('');

    const payload: SaveQuoteRequest = {
      prospectId: prospect.id,
      input: request,
      result: quote,
    };

    this.http
      .post('/quotes/saved', payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saveSuccessMessage.set(`Cotización guardada correctamente para ${prospect.fullName}.`);
          this.isSavingQuote.set(false);
        },
        error: (error: unknown) => {
          this.saveErrorMessage.set(this.getSaveErrorMessage(error));
          this.isSavingQuote.set(false);
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

  private buildQuoteRequestFromForm(): QuoteRequest | null {
    const { type, totalValue, downPaymentPercentage, termMonths, residualPercentage } =
      this.form.getRawValue();

    if (typeof totalValue !== 'number' || typeof downPaymentPercentage !== 'number') {
      return null;
    }

    const request: QuoteRequest = {
      type,
      totalValue,
      downPaymentPercentage,
      termMonths,
    };

    if (type === 'arrendamiento') {
      if (typeof residualPercentage !== 'number') {
        return null;
      }
      request.residualPercentage = residualPercentage;
    }

    return request;
  }

  private getErrorMessage(error: unknown): string {
    const message = getHttpMessage(error);
    if (message) {
      return message;
    }

    return 'No fue posible generar la cotización. Intenta de nuevo.';
  }

  private getProspectErrorMessage(error: unknown): string {
    const message = getHttpMessage(error);
    if (message) {
      return message;
    }

    return 'No fue posible completar la solicitud del prospecto. Intenta de nuevo.';
  }

  private getSaveErrorMessage(error: unknown): string {
    const message = getHttpMessage(error);
    if (message) {
      return message;
    }

    return 'No fue posible guardar la cotización. Intenta de nuevo.';
  }

  private getDownloadErrorMessage(): string {
    return 'No fue posible descargar el PDF de la cotización. Intenta de nuevo.';
  }
}

function getHttpMessage(error: unknown): string | null {
  if (error instanceof HttpErrorResponse) {
    const message = error.error?.message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join(' ');
    }
    if (typeof error.error === 'string') {
      return error.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return null;
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
