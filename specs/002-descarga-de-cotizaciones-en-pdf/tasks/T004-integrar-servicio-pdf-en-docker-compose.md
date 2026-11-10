Type: task
ID: T004
Name: Integrar servicio PDF en Docker Compose
Spec: 002-descarga-de-cotizaciones-en-pdf
Status: Completed
Date: 2026-11-09 18:16
Branch: task/002-t004-integrar-servicio-pdf-en-docker-compose
Depends on: T001
Covers: R7, R8

## Description
Este trabajo incorpora el servicio PDF al entorno local de Docker Compose para que frontend y backend puedan comunicarse con él. La integración debe ser compatible con la estructura actual y dejar abierta la extensión a otros generadores de documentos en el futuro.

## To do
- [x] Agregar el servicio PDF a Docker Compose junto con los servicios existentes.
- [x] Configurar la red y la comunicación necesaria entre la interfaz y el servicio PDF.
- [x] Validar que el entorno local levanta correctamente y permite la descarga del documento.

## Test (acceptance criteria)
- [x] Un test o verificación de entorno confirma que Docker Compose inicia el servicio PDF junto con frontend y backend.
- [x] Una comprobación confirma que la interfaz puede comunicarse con el servicio PDF en el entorno local.
- [x] Un test confirma que la estructura de compose y la organización del servicio permanecen extensibles para futuros documentos sin tocar este alcance.
