import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { QUOTE_GATEWAY } from './features/quote/application/quote-gateway.port';
import { HttpQuoteGateway } from './features/quote/infrastructure/http-quote.gateway';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    { provide: QUOTE_GATEWAY, useClass: HttpQuoteGateway },
  ],
};
