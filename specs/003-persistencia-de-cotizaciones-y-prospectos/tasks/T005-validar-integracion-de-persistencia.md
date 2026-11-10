Type: task
ID: T005
Name: Validar integración de persistencia
Spec: 003-persistencia-de-cotizaciones-y-prospectos
Status: pending
Date: 2026-11-10 09:56
Branch: task/003-t005-validar-integracion-de-persistencia
Depends on: T001, T002, T003, T004
Covers: R9, R10, R11

## Description
Esta tarea valida la integración completa del sistema de persistencia para confirmar que PostgreSQL, migraciones, microservicios y flujo de cotización funcionan juntos. La intención es asegurar que la nueva persistencia no altere las reglas financieras ni la experiencia del usuario.

## To do
- [ ] Ejecutar la verificación de integración con Docker Compose para PostgreSQL, `customers` y quote-generator.
- [ ] Probar el flujo de extremo a extremo con prospectos activos, alta de prospecto nuevo y guardado de cotización.
- [ ] Confirmar que las reglas financieras existentes no cambian y que las migraciones siguen siendo la vía autorizada de esquema.
- [ ] Documentar desviaciones o ajustes necesarios antes de cerrar la especificación.

## Test (acceptance criteria)
- [ ] El flujo completo de búsqueda, registro y guardado de cotización funciona con Docker Compose levantado.
- [ ] Las migraciones de PostgreSQL se aplican y el entorno integrado arranca sin cambios manuales al esquema.
- [ ] La generación de cotizaciones conserva las tasas, plazos y validaciones vigentes sin cambios en las reglas financieras.
- [ ] La validación final confirma que la persistencia no agrega consultas de historial ni funcionalidad de reestructuración.
