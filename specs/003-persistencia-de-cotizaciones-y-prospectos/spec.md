Name: 003 Persistencia de Cotizaciones y Prospectos
Status: In progress
Date: 2026-11-10 09:36

## Description
Esta especificación agrega persistencia de cotizaciones y un catálogo de prospectos al cotizador. El usuario podrá seleccionar un prospecto existente o registrarlo antes de asociarlo a una cotización calculada y guardarla explícitamente. Las cotizaciones guardadas conservarán los datos y resultados originales para referencia futura, sin incluir el manejo de reestructuras.

## Goals
- Administrar prospectos mediante el microservicio `customers`, incluyendo su alta, consulta, actualización y baja lógica.
- Permitir buscar y seleccionar prospectos activos en el flujo de cotización, y registrar uno nuevo si aún no existe.
- Guardar explícitamente las cotizaciones calculadas asociadas a prospectos registrados, conservando el resultado original.
- Usar PostgreSQL y migraciones para crear y modificar la estructura persistente requerida.

## Out of scope
- Consultar o listar cotizaciones previamente guardadas desde la interfaz.
- Reestructurar cotizaciones o modificar las reglas y cálculos financieros existentes.
- Autenticación, autorización y gestión de usuarios.
- Borrado físico de prospectos o eliminación de cotizaciones asociadas.

## Requirements
- R1: El formulario debe permitir buscar y seleccionar un prospecto activo existente antes de guardar una cotización.
- R2: El formulario debe permitir registrar un prospecto con nombre, teléfono y correo electrónico obligatorios. El correo electrónico debe ser único; si ya está registrado, la API debe rechazar el alta y la interfaz debe mostrar un error entendible en español.
- R3: El microservicio `customers` debe exponer operaciones para crear, consultar, actualizar y eliminar lógicamente prospectos. Los prospectos eliminados lógicamente deben conservarse en la base de datos y dejar de aparecer en las búsquedas y opciones de selección.
- R4: Si el usuario necesita cotizar para un prospecto no registrado, debe poder registrarlo y seleccionarlo antes de guardar la cotización.
- R5: La cotización debe calcularse con las reglas existentes. Solo después de que el usuario solicite explícitamente Guardar, el backend debe persistirla asociada a un prospecto registrado.
- R6: Cada cotización guardada debe conservar el identificador del prospecto asociado, los datos de entrada y la respuesta calculada completa, incluida la tabla de amortización, sin recalcular ni alterar los resultados guardados.
- R7: Guardar una cotización debe producir una confirmación visible. Si falla el guardado, la interfaz debe conservar la cotización calculada, comunicar el error en español y permitir reintentar sin presentar el guardado como exitoso.
- R8: La baja lógica de un prospecto no debe eliminar ni modificar sus cotizaciones ya guardadas. Los datos asociados a cotizaciones anteriores deben permanecer persistidos.
- R9: La estructura de PostgreSQL requerida por los servicios debe crearse y modificarse mediante migraciones versionadas, no mediante cambios manuales de esquema como requisito normal de ejecución.
- R10: Docker Compose debe iniciar PostgreSQL y los servicios que requieran persistencia, incluido `customers`, con la configuración necesaria para que la interfaz pueda usar las operaciones de prospectos y guardar cotizaciones.
- R11: Los cálculos financieros y validaciones de negocio existentes permanecen autoritativos en el backend de cotizaciones; esta especificación no cambia tasas, plazos, fórmulas ni importes.

## Acceptance criteria
- [ ] Se puede buscar y seleccionar un prospecto activo existente para una cotización.
- [ ] Se puede registrar un prospecto con nombre, teléfono y correo obligatorios; un correo duplicado se rechaza y el usuario recibe un mensaje en español.
- [ ] Las operaciones de consulta, actualización y baja lógica están disponibles en `customers`; los prospectos dados de baja no aparecen en resultados de búsqueda ni en opciones de selección.
- [ ] Una cotización calculada no se persiste hasta que el usuario solicita Guardar y está asociada a un prospecto registrado.
- [ ] Una cotización guardada conserva el prospecto asociado, las entradas originales y la respuesta completa con la tabla de amortización; los valores persistidos coinciden con la cotización calculada.
- [ ] Una falla al guardar conserva visible la cotización, muestra un error en español y permite reintentar.
- [ ] Dar de baja un prospecto no borra ni modifica sus cotizaciones guardadas.
- [ ] Las tablas requeridas se crean y actualizan mediante migraciones de PostgreSQL, y Docker Compose permite iniciar los servicios y la base de datos integrados.
- [ ] La generación de cotizaciones mantiene las reglas de cálculo vigentes.
- [ ] No se agrega una interfaz para consultar cotizaciones guardadas ni una funcionalidad de reestructuración.

## Technical notes
El frontend existente usa Angular y el backend de cotizaciones y el microservicio `customers` usan NestJS. El microservicio `customers` administra los endpoints y persistencia de prospectos; el backend de cotizaciones persiste las cotizaciones y su asociación con prospectos registrados. PostgreSQL es la base de datos solicitada y Docker Compose es el entorno integrado existente. La herramienta concreta de migraciones será `Flyway`.

## Open questions


## Tasks
- [ ] [T001 - Preparar PostgreSQL y migraciones](tasks/T001-preparar-postgresql-y-migraciones.md)
- [ ] [T002 - Implementación del catálogo de prospectos](tasks/T002-implementacion-de-catalogo-de-prospectos.md)
- [ ] [T003 - Persistir cotizaciones](tasks/T003-persistir-cotizaciones.md)
- [ ] [T004 - Integrar prospectos y guardado en la interfaz](tasks/T004-integrar-prospectos-y-guardado-en-la-interfaz.md)
- [ ] [T005 - Validar integración de persistencia](tasks/T005-validar-integracion-de-persistencia.md)
