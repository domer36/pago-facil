Type: task
ID: T002
Name: Rediseñar resultado y amortización
Spec: 004-rediseno-de-experiencia-del-cotizador
Status: pending
Date: 2026-11-12 12:16
Branch: task/004-t002-rediseno-resultado-amortizacion
Depends on: T001
Covers: R2, R3, R4, R5, R8

## Description
Actualizar la pantalla separada de resultado para presentar el resumen de la cotización, el desglose completo de amortización y las acciones existentes, usando el sistema visual compartido. Conservar guardado explícito, descarga PDF, manejo de errores y resultados financieros.

## To do
- [ ] Rediseñar el resumen y la tabla completa de amortización siguiendo la referencia visual, conservando los datos y el orden de pagos existentes.
- [ ] Mantener disponibles las acciones de guardado y descarga PDF con sus estados, confirmaciones y errores en español.
- [ ] Adaptar el resultado y la tabla a escritorio, tableta y móvil; mantener la tabla consultable sin desbordar horizontalmente la página a 360 px.

## Test (acceptance criteria)
- [ ] Ejecutar las pruebas unitarias del frontend y `npm run build` desde `frontend/webapp`.
- [ ] Verificar visualmente a 1280 px, 768 px y 360 px que el resumen, las acciones y la tabla son utilizables, sin desbordamiento horizontal de página a 360 px.
- [ ] Confirmar que guardar y descargar siguen usando los servicios existentes, que sus fallos se muestran como errores y que la amortización conserva los datos financieros previos.
