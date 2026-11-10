Type: task
ID: T002
Name: Implementación del catálogo de prospectos
Spec: 003-persistencia-de-cotizaciones-y-prospectos
Status: pending
Date: 2026-11-10 09:56
Branch: task/003-t002-implementacion-de-catalogo-de-prospectos
Depends on: T001
Covers: R1, R2, R3, R4

## Description
Esta tarea completa el microservicio `customers` para crear, consultar, actualizar y dar de baja lógicamente prospectos con validaciones de negocio. También deja listo el flujo para buscar y seleccionar prospectos activos antes de guardar una cotización.

## To do
- [ ] Definir el modelo y endpoints del catálogo de prospectos para consulta, alta, actualización y baja lógica.
- [ ] Implementar validaciones para nombre, teléfono y correo obligatorio, además de correo único y mensajes en español.
- [ ] Asegurar que los prospectos dados de baja no aparezcan en búsquedas ni selecciones activas.
- [ ] Exponer la búsqueda y la selección del prospecto para que la cotización pueda asociarse a un registro activo.

## Test (acceptance criteria)
- [ ] La búsqueda de prospectos devuelve solamente registros activos y excluye a los dados de baja lógica.
- [ ] El alta con correo duplicado falla con un error entendible en español y no crea un segundo registro.
- [ ] Las operaciones de actualización y baja lógica están disponibles en `customers` y conservan el registro histórico.
- [ ] El flujo de cotización puede seleccionar un prospecto existente antes de guardar la cotización.
