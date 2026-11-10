# Cotizador de financiamiento

Aplicación web en español para cotizar crédito simple, arrendamiento y meses sin
intereses (MSI). El usuario ingresa los datos del financiamiento y obtiene una
tabla de amortización; los cálculos y validaciones se realizan en el backend.

## Desarrollo guiado por especificaciones (SDD)

El proyecto utiliza **Spec Driven Development (SDD)**: primero se documentan el
alcance y los requisitos en `specs/`, y luego se implementan mediante tareas
asociadas a esas especificaciones. Las especificaciones vigentes son
[001 - Cotizador de financiamiento](specs/001-cotizador-de-financiamiento/spec.md)
[002 - Descarga de cotizaciones en PDF](specs/002-descarga-de-cotizaciones-en-pdf/spec.md).

## Tecnologías

- **Frontend:** Angular y TypeScript.
- **Backend:** NestJS y TypeScript.
- **Servicio PDF:** NestJS y TypeScript.
- **Servidor web:** Nginx, que sirve la interfaz y reenvía las solicitudes al
  backend de cotizaciones y al servicio PDF.
- **Contenedores:** Docker y Docker Compose.

## Iniciar la aplicación

Requiere Docker y Docker Compose. Desde la raíz del repositorio, ejecuta:

```bash
docker compose up --build
```

Abre [http://localhost:4200](http://localhost:4200) para usar el cotizador.
Docker Compose inicia el backend, el servicio PDF y el frontend. Nginx enruta
internamente las solicitudes de cotización al backend y las solicitudes de
documentos al servicio PDF; ninguno de estos servicios expone su puerto al host.

## Descargar una cotización en PDF

Después de generar una cotización válida, usa **Descargar cotización en PDF**.
El navegador descarga `cotizacion.pdf`, un documento en español, tamaño A4 y
con fecha de generación. Incluye los datos de entrada, el resumen financiero y
la tabla completa de amortización; en arrendamiento, muestra el pago residual
por separado.

La interfaz envía al servicio PDF la respuesta calculada de la cotización. El
servicio presenta esos valores sin recalcularlos ni modificarlos. Si falla la
descarga, la cotización permanece visible y puedes volver a intentarlo. El
endpoint `POST /documents/quote` se enruta por Nginx hacia el servicio PDF y
recibe como JSON la respuesta de `POST /quotes`.

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
