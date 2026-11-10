Type: task
ID: T004
Name: Integrar prospectos y guardado en la interfaz
Spec: 003-persistencia-de-cotizaciones-y-prospectos
Status: pending
Date: 2026-11-10 09:56
Branch: task/003-t004-integrar-prospectos-y-guardado-en-la-interfaz
Depends on: T002, T003
Covers: R1, R2, R4, R7

## Description
Esta tarea integra la búsqueda, selección y registro de prospectos en la interfaz de cotización, además del guardado explícito con manejo de errores. El usuario debe poder registrar un prospecto nuevo si no existe y reintentar el guardado sin perder la cotización calculada.

## To do
- [ ] Actualizar el formulario de cotización para buscar y seleccionar prospectos activos existentes.
- [ ] Implementar la creación de un prospecto desde la interfaz con nombre, teléfono y correo obligatorios.
- [ ] Mostrar errores en español ante correos duplicados y fallas al guardar, manteniendo visible la cotización calculada.
- [ ] Permitir reintento del guardado sin presentar un éxito falso si la operación falla.

## Test (acceptance criteria)
- [ ] El usuario puede buscar un prospecto activo existente antes de guardar una cotización y seleccionarlo en el formulario.
- [ ] El registro de un nuevo prospecto funciona con los datos obligatorios y muestra un mensaje en español si el correo ya existe.
- [ ] Si falla el guardado, la cotización calculada sigue visible y el usuario puede reintentar sin que se marque como guardada.
- [ ] El flujo de alta de prospecto y guardado presenta errores entendibles para el usuario en español.
