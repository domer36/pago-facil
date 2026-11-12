Type: task
ID: T003
Name: Integrar selector y alta de prospectos
Spec: 004-rediseno-de-experiencia-del-cotizador
Status: pending
Date: 2026-11-12 12:16
Branch: task/004-t003-selector-alta-prospectos
Depends on: T002
Covers: R6, R7, R8

## Description
Integrar en la pantalla de resultado un selector con autocompletado que busque prospectos activos por nombre y correo, con un máximo de diez coincidencias por filtro. Permitir registrar prospectos desde un modal, reutilizando las validaciones, mensajes y comportamiento de guardado existentes.

## To do
- [ ] Añadir el desplegable con búsqueda por nombre y correo entre prospectos activos, limitar cada lista de coincidencias a diez y permitir seleccionar un prospecto para la cotización.
- [ ] Integrar el modal de alta con nombre, teléfono y correo obligatorios, conservando las validaciones y mensajes de error en español.
- [ ] Conservar el servicio y comportamiento de guardado existente; no indicar éxito cuando el alta falle.

## Test (acceptance criteria)
- [ ] Ejecutar las pruebas unitarias del frontend y `npm run build` desde `frontend/webapp`.
- [ ] Verificar que la búsqueda por nombre y por correo solo incluya prospectos activos, no muestre más de diez coincidencias y permita seleccionar un resultado.
- [ ] Verificar que el alta rechaza los campos obligatorios vacíos, muestra errores entendibles en español y no informa éxito ante un fallo del servicio.
