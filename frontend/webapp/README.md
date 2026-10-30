# Cotizador de financiamiento

Interfaz Angular para cotizar crédito simple, arrendamiento y meses sin intereses.

## Desarrollo local

Desde la raíz del repositorio, inicia primero el backend NestJS en el puerto
`3000`:

```bash
cd backend/quote-generator
npm run start:dev
```

En otra terminal, desde la raíz del repositorio, inicia Angular:

```bash
cd frontend/webapp
npm start
```

Abre `http://localhost:4200/`. El servidor de desarrollo reenvía las solicitudes
`/quotes` a `http://localhost:3000`, según `proxy.conf.json`.

## Build y pruebas

```bash
npm run build
npm test -- --watch=false
```
