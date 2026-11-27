# Dashboard

Microservicio NestJS que agrega las métricas de cotizaciones guardadas y asociadas
a prospectos activos.

## Endpoint

`GET /dashboard/metrics?from=YYYY-MM-DD&to=YYYY-MM-DD`

- Si se omiten `from` y `to`, el intervalo usa hoy y los 29 días anteriores en
  la zona horaria de México.
- `from` es inclusivo y `to` es inclusivo. Internamente se transforma el inicio
  de `from` y el inicio del día siguiente a `to` a UTC.
- Las fechas persistidas siguen almacenándose como `TIMESTAMPTZ`/UTC; este
  servicio no las modifica ni las convierte al persistirlas.
- La zona horaria usada para interpretar los límites es
  `America/Mexico_City`, incluyendo el horario de verano vigente en PostgreSQL/ICU.
- Los prospectos frecuentes consultan los últimos 30 días y no dependen del
  intervalo filtrable.
- Las solicitudes recientes consultan las diez cotizaciones más recientes y no
  dependen del intervalo filtrable.

Ante un fallo de consulta devuelve HTTP 500 con un mensaje comprensible y nunca
una estructura exitosa con métricas en cero.
