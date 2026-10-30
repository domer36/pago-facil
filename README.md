# Cotizador de financiamiento

Aplicación local para cotizar crédito simple, arrendamiento y meses sin intereses.
Docker Compose inicia el backend NestJS y el frontend Angular; Nginx sirve la
interfaz en `http://localhost:4200` y reenvía `/quotes` al backend.

## Iniciar la aplicación

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Abre `http://localhost:4200` y captura los datos de una cotización. La conexión
se enruta internamente entre los servicios de Compose, sin configurar CORS ni
exponer el puerto del backend al host.

Para comprobar directamente el endpoint integrado desde otra terminal:

```bash
curl -i http://localhost:4200/quotes \
  -H 'Content-Type: application/json' \
  -d '{"type":"msi","totalValue":100000,"downPaymentPercentage":0,"termMonths":6}'
```

La respuesta debe tener estado `201` o `200` y contener la cotización con seis
pagos. Una solicitud inválida permite comprobar el error del backend:

```bash
curl -i http://localhost:4200/quotes \
  -H 'Content-Type: application/json' \
  -d '{"type":"msi","totalValue":100,"downPaymentPercentage":0,"termMonths":6}'
```

Esta última solicitud debe devolver `400 Bad Request`. También puedes enviarla
desde el formulario y verificar que se muestre el mensaje de validación.

Detén y elimina los contenedores con:

```bash
docker compose down
```
