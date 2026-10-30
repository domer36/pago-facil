Type: task
ID: T003
Name: Integrar la aplicación con Docker Compose
Spec: 001-cotizador-de-financiamiento
Status: pending
Date: 2026-10-30 13:19
Branch: task/001-t003-integracion-docker-compose
Depends on: T001, T002
Covers: R13

## Description
Configurar Docker Compose para iniciar conjuntamente el backend NestJS y el frontend Angular existentes. La configuración debe permitir acceder a la interfaz y que esta se comunique con el endpoint de cotizaciones desde el entorno local.

## To do
- [ ] Configurar la construcción y ejecución de los servicios frontend y backend mediante Docker Compose, incluyendo la comunicación entre ellos.
- [ ] Documentar los comandos necesarios para iniciar la aplicación localmente y verificar el flujo de cotización integrado.

## Test (acceptance criteria)
- [ ] `docker compose config` valida la configuración sin errores.
- [ ] `docker compose up --build` inicia los servicios y la interfaz es accesible localmente.
- [ ] Una cotización enviada desde la interfaz desplegada en Compose llega al backend y muestra el resultado o el error de validación esperado.
