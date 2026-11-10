Type: task
ID: T001
Name: Preparar PostgreSQL y migraciones
Spec: 003-persistencia-de-cotizaciones-y-prospectos
Status: pending
Date: 2026-11-10 09:56
Branch: task/003-t001-preparar-postgresql-y-migraciones
Depends on: -
Covers: R9, R10

## Description
Esta tarea prepara la base de datos y el entorno de ejecución para que los servicios de prospectos y cotizaciones usen PostgreSQL con migraciones versionadas. Al dejar el esquema y la infraestructura listos, el resto del trabajo puede construirse sobre una base consistente y reproducible.

## To do
- [ ] Revisar el esquema necesario para prospectos y cotizaciones y definir las migraciones Flyway iniciales.
- [ ] Ajustar Docker Compose para levantar PostgreSQL y las variables de entorno de los servicios que requieren persistencia.
- [ ] Validar el arranque integrado para que la base se cree y aplique la migración sin cambios manuales de esquema.

## Test (acceptance criteria)
- [ ] `docker compose up` inicializa PostgreSQL y deja los servicios conectados a la base de datos.
- [ ] Las migraciones Flyway crean las tablas y columnas necesarias para prospectos y cotizaciones asociadas.
- [ ] El primer arranque del entorno no requiere cambios manuales de esquema ni pasos fuera de las migraciones versionadas.
