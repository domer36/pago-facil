# Guía para asistentes de código

## Contexto del proyecto

Cotizador web en español para crédito simple, arrendamiento y meses sin
intereses (MSI). La especificación funcional vigente está en
[`specs/001-cotizador-de-financiamiento/spec.md`](specs/001-cotizador-de-financiamiento/spec.md);
consúltala antes de cambiar reglas de negocio. El proyecto sigue SDD: requisitos
en `specs/`, trabajo dividido en `specs/*/tasks/`.

## Arquitectura

- `backend/quote-generator`: API NestJS. El código de cotizaciones se organiza
  por funcionalidad (`src/features/quotes/`) en dominio, aplicación y
  presentación.
- `frontend/webapp`: Angular. La funcionalidad de cotización está en
  `src/app/features/quote/`, separada en dominio, aplicación, infraestructura y
  presentación.
- `compose.yaml`: inicia ambos servicios. El frontend sirve la aplicación con
  Nginx y enruta las solicitudes al backend; el acceso local es
  `http://localhost:4200`.

Mantén la lógica financiera y la validación autoritativa en el backend. El
frontend recopila datos, invoca el gateway HTTP y presenta la respuesta y los
errores recibidos; no dupliques allí los cálculos financieros.

## Reglas de negocio que no se deben cambiar incidentalmente

- Crédito simple: tasa anual fija de 35%; arrendamiento: 27%; MSI: 0%. Las tasas
  positivas se convierten a tasa mensual dividiendo entre 12.
- Los plazos permitidos son 6, 12, 18, 24, 36 o 48 meses.
- El valor total debe ser positivo y el monto financiado de al menos $50,000
  MXN. Pago inicial y residual (solo arrendamiento) deben estar entre 0% y 80%;
  su suma no puede superar 100%.
- Los importes se presentan en MXN con dos decimales. Conserva precisión en los
  cálculos y ajusta el último pago periódico para cerrar el saldo; el residual
  de arrendamiento se informa y liquida por separado.

La especificación es la fuente de verdad completa, incluidos los campos de la
respuesta y criterios de aceptación.

## Desarrollo y validación

Para desarrollo integrado, desde la raíz:

```bash
docker compose up --build
```

Para validar cambios en un solo componente, ejecuta sus comandos desde su
directorio:

```bash
# Backend
cd backend/quote-generator
npm test
npm run test:e2e
npm run lint
npm run build

# Frontend
cd frontend/webapp
npm test
npm run build
```

El backend usa Vitest para pruebas unitarias y e2e; el frontend ejecuta sus
pruebas unitarias con Angular/Vitest. Ejecuta las pruebas pertinentes al cambio
y no afirmes que pasaron si no las ejecutaste.

## Flujo de trabajo

- Para funcionalidad nueva o cambios de alcance, revisa y actualiza la
  especificación y las tareas SDD correspondientes antes de implementar.
- Las instrucciones del backend en
  [`backend/quote-generator/AGENTS.md`](backend/quote-generator/AGENTS.md)
  complementan esta guía para trabajo dentro de ese componente.
- Conserva el idioma español de la interfaz y los mensajes orientados al usuario.
- Evita añadir dependencias si la solución puede seguir los patrones existentes.
