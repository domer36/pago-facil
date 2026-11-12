Type: task
ID: T001
Name: Rediseñar pantalla de cotización
Spec: 004-rediseno-de-experiencia-del-cotizador
Status: Completed
Date: 2026-11-12 12:16
Branch: task/004-t001-rediseno-pantalla-cotizacion
Depends on: -
Covers: R1, R3, R4, R5, R8

## Description
Rediseñar la pantalla de captura de cotizaciones con la organización y paleta fintech de las referencias. Incluir la cabecera fija de Pago Facil, Cotizador financiero y Usuario, manteniendo la selección de producto, captura, cálculo y navegación existentes.

## To do
- [x] Implementar la cabecera compartida con los valores fijos de marca, producto y usuario, sin llamadas de autenticación ni servicios externos.
- [x] Rediseñar la selección de producto, el formulario y el resumen estimado en español, conservando el flujo y los datos financieros actuales.
- [x] Adaptar la pantalla a escritorio, tableta y móvil; evitar desbordamiento horizontal de página a 360 px.

## Test (acceptance criteria)
- [x] Ejecutar las pruebas unitarias del frontend y `npm run build` desde `frontend/webapp`.
- [ ] Verificar visualmente a 1280 px, 768 px y 360 px que la pantalla es utilizable y no causa desbordamiento horizontal a 360 px.
- [x] Confirmar que una misma entrada mantiene los valores de cálculo previos y que la cabecera muestra los tres valores fijos requeridos.
