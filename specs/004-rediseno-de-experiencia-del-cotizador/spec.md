Name: 004 Rediseño de Experiencia del Cotizador
Status: Approved
Date: 2026-11-10 16:36

## Description
Esta especificación define la actualización visual y de experiencia del cotizador financiero a partir de las imágenes de referencia proporcionadas. El flujo conservará el cotizador y la tabla de amortización en pantallas distintas, con un diseño fintech adaptable y una cabecera de marca y usuario con datos fijos. La selección de prospectos se presentará en la pantalla de resultado mediante un desplegable con autocompletado, y el alta seguirá disponible desde un modal.

## Goals
- Actualizar la presentación de las pantallas del cotizador y del resultado de cotización con una interfaz en español y una paleta fintech inspirada en las referencias.
- Adaptar la interfaz a escritorio, tableta y móvil sin cambiar el flujo financiero existente.
- Facilitar la selección de prospectos existentes y el alta de nuevos prospectos desde la pantalla de resultado.
- Conservar las funciones actuales de cálculo, amortización, persistencia, manejo de errores y descarga PDF.

## Out of scope
- Cambiar cálculos, tasas, validaciones financieras, contratos de API o persistencia definidos en las especificaciones existentes.
- Implementar autenticación, gestión real de usuarios o carga dinámica de datos de marca.
- Agregar funciones nuevas de administración o consulta de cotizaciones y prospectos no incluidas en las especificaciones existentes.

## Requirements
- R1: La pantalla de cotización y la pantalla de resultado con la tabla de amortización deben seguir siendo pantallas separadas. La pantalla de cotización debe presentar la selección de producto, captura de datos y resumen estimado de acuerdo con la referencia visual.
- R2: La pantalla de resultado debe presentar un resumen de la cotización, el desglose completo de pagos y las acciones existentes, incluida la descarga PDF y el guardado cuando corresponda, de acuerdo con la referencia visual.
- R3: La interfaz debe usar una paleta fintech agradable inspirada en las referencias, con tonos verdes o teal y neutros, conservando el idioma español y la legibilidad de textos, formularios, estados y tabla.
- R4: La interfaz debe adaptar sus componentes a escritorio, tableta y móvil. A 360 px de ancho, el contenido de ambas pantallas debe seguir siendo utilizable sin desbordamiento horizontal de la página; la tabla de amortización debe permanecer consultable.
- R5: La cabecera debe mostrar una representación tipográfica sencilla de la marca «Pago Facil», el nombre del producto «Cotizador financiero» y el nombre de usuario fijo «Usuario». Estos valores no deben depender de autenticación ni de servicios externos.
- R6: La selección de prospecto debe estar disponible en la pantalla de resultado mediante un desplegable con autocompletado que busque por nombre y correo electrónico entre los prospectos activos. Cada filtro debe mostrar como máximo 10 resultados coincidentes; los resultados deben permitir seleccionar un prospecto para la cotización.
- R7: Desde la pantalla de resultado se debe poder abrir un modal para registrar un prospecto con nombre, teléfono y correo electrónico obligatorios. El modal debe conservar las validaciones, mensajes de error y comportamiento de guardado de prospectos existentes.
- R8: El rediseño debe conservar las reglas y resultados financieros, la selección y alta de prospectos, el guardado explícito de cotizaciones, los mensajes de error y la descarga de PDF existentes; no debe presentar como exitosas operaciones que fallen.

## Acceptance criteria
- [ ] El flujo mantiene una pantalla de cotización y otra de resultado; la primera permite capturar y calcular una cotización y la segunda presenta su resumen y tabla completa de amortización.
- [ ] La pantalla de resultado mantiene disponibles las acciones existentes de guardado de cotización y descarga PDF, y sus errores y confirmaciones siguen siendo visibles y entendibles en español.
- [ ] Las pantallas usan la paleta y organización visual de las referencias, con componentes legibles y consistentes en español.
- [ ] A anchos de 1280 px, 768 px y 360 px se puede utilizar el flujo completo; a 360 px no hay desbordamiento horizontal de la página y la tabla de amortización sigue siendo consultable.
- [ ] La cabecera muestra «Pago Facil», «Cotizador financiero» y «Usuario» como valores fijos, sin requerir autenticación ni llamadas externas.
- [ ] En el resultado se puede buscar un prospecto activo por nombre o correo, y cada filtro devuelve como máximo 10 coincidencias seleccionables.
- [ ] En el resultado se puede abrir el modal y registrar un prospecto con nombre, teléfono y correo obligatorios; los errores del alta se muestran en español y no se indica éxito cuando el alta falla.
- [ ] Una misma entrada de cotización produce los mismos datos financieros que antes del rediseño; guardar y descargar siguen usando los servicios y datos existentes.

## Technical notes
El frontend existente usa Angular. Se deben reutilizar los servicios y contratos existentes para prospectos, cotizaciones y PDF; no se deben duplicar cálculos financieros en el frontend ni cambiar los servicios backend. Las referencias visuales se encuentran en las imágenes proporcionadas. No se proporcionó un archivo de logo; se usará una representación tipográfica sencilla de «Pago Facil». Los nombres de marca y usuario son estáticos por ahora.

## Open questions
- Ninguna.

## Proposed tasks
Outline only; the task files are created later by create-tasks.
- T001 - Rediseñar la pantalla de cotización: Aplicar el sistema visual fintech, cabecera y diseño adaptable al flujo de captura.
- T002 - Rediseñar la pantalla de resultado: Presentar resumen, tabla de amortización y acciones existentes con diseño adaptable.
- T003 - Integrar selector y alta de prospectos: Añadir el desplegable con autocompletado limitado y conservar el modal y sus validaciones existentes.
- T004 - Validar experiencia y regresiones: Comprobar el flujo en escritorio, tableta y móvil y verificar que se conserven cálculo, guardado, errores y descarga PDF.
