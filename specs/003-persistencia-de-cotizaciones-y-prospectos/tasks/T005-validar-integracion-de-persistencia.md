Type: task
ID: T005
Name: Validar integración de persistencia
Spec: 003-persistencia-de-cotizaciones-y-prospectos
Status: done
Date: 2026-11-10 09:56
Branch: task/003-t005-validar-integracion-de-persistencia
Depends on: T001, T002, T003, T004
Covers: R9, R10, R11

## Description
Esta tarea valida la integración completa del sistema de persistencia para confirmar que PostgreSQL, migraciones, microservicios y flujo de cotización funcionan juntos. La intención es asegurar que la nueva persistencia no altere las reglas financieras ni la experiencia del usuario.

## To do
- [x] Ejecutar la verificación de integración con Docker Compose para PostgreSQL, `customers` y quote-generator.
- [x] Probar el flujo de extremo a extremo con prospectos activos, alta de prospecto nuevo y guardado de cotización.
- [x] Confirmar que las reglas financieras existentes no cambian y que las migraciones siguen siendo la vía autorizada de esquema.
- [x] Documentar desviaciones o ajustes necesarios antes de cerrar la especificación.

## Test (acceptance criteria)
- [x] El flujo completo de búsqueda, registro y guardado de cotización funciona con Docker Compose levantado.
- [x] Las migraciones de PostgreSQL se aplican y el entorno integrado arranca sin cambios manuales al esquema.
- [x] La generación de cotizaciones conserva las tasas, plazos y validaciones vigentes sin cambios en las reglas financieras.
- [x] La validación final confirma que la persistencia no agrega consultas de historial ni funcionalidad de reestructuración.

## Validation notes
- `docker compose up --build -d` inició correctamente PostgreSQL, Flyway, `customers`, `quote-generator` y el frontend.
- Se verificó el alta de prospecto con `POST /customers`, la creación de cotización con `POST /quotes` y el guardado con `POST /quotes/saved` usando el contenedor `backend` dentro de la red de Docker.
- PostgreSQL quedó con las tablas `prospects` y `quotes` creadas por migración y con un registro de prospecto y una cotización persistidos.
- No se detectaron desviaciones de negocio; la lógica financiera del backend quedó intacta y la persistencia sigue limitándose a guardar la cotización asociada a un prospecto activo.
