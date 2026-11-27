import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('App routes', () => {
  it('keeps the existing quote route and exposes the dashboard route', () => {
    expect(routes.map((route) => route.path)).toContain('');
    expect(routes.map((route) => route.path)).toContain('dashboard');
  });
});
