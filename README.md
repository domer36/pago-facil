# Cotizador de financiamiento

Aplicación web en español para cotizar crédito simple, arrendamiento y meses sin
intereses (MSI). El usuario ingresa los datos del financiamiento y obtiene una
tabla de amortización; los cálculos y validaciones se realizan en el backend.

## Desarrollo guiado por especificaciones (SDD)

El proyecto utiliza **Spec Driven Development (SDD)**: primero se documentan el
alcance y los requisitos en `specs/`, y luego se implementan mediante tareas
asociadas a esa especificación. La especificación del cotizador está en
[`specs/001-cotizador-de-financiamiento/spec.md`](specs/001-cotizador-de-financiamiento/spec.md).

## Tecnologías

- **Frontend:** Angular y TypeScript.
- **Backend:** NestJS y TypeScript.
- **Servidor web:** Nginx, que sirve la interfaz y reenvía las solicitudes al
  backend.
- **Contenedores:** Docker y Docker Compose.

## Iniciar la aplicación

Requiere Docker y Docker Compose. Desde la raíz del repositorio, ejecuta:

```bash
docker compose up --build
```

Abre [http://localhost:4200](http://localhost:4200) para usar el cotizador.
Docker Compose inicia el backend y el frontend; Nginx enruta internamente las
solicitudes al backend sin exponer su puerto al host.

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
