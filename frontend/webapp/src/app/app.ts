import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuotePageComponent } from './features/quote/presentation/quote-page.component';

@Component({
  imports: [QuotePageComponent, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
