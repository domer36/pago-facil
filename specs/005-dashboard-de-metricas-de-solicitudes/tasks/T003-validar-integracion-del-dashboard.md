Type: task
ID: T003
Name: Validar integración del dashboard
Spec: 005-dashboard-de-metricas-de-solicitudes
Status: pending
Date: 2026-11-26 16:15
Branch: task/005-t003-validar-integracion-del-dashboard
Depends on: T001, T002
Covers: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11

## Description
Completar la validación integrada del dashboard y del flujo existente. Las pruebas deben comprobar los datos persistidos, los límites por zona horaria, la presentación de estados y la ausencia de cambios en la cotización.

## To do
- [ ] Agregar o ajustar pruebas unitarias y e2e pertinentes al agregado backend y a la navegación frontend.
- [ ] Preparar datos de prueba con cotizaciones guardadas de los tres tipos, asociadas y no asociadas a prospectos.
- [ ] Verificar intervalos en zona horaria de México y persistencia en UTC.
- [ ] Validar conteos, montos separados, listados, estados vacíos y errores desde la integración completa.
- [ ] Confirmar que el flujo actual de creación y guardado de cotizaciones no se modifica.

## Test (acceptance criteria)
- [ ] Las pruebas cubren correctamente el total y los desgloses de crédito simple, arrendamiento y MSI dentro de un intervalo seleccionado.
- [ ] Los valores agregados coinciden con las cotizaciones persistidas asociadas a prospectos y tienen formato MXN de dos decimales.
- [ ] Los últimos 30 días son el intervalo inicial y el filtro cambia métricas y gráficas sin cambiar los listados independientes.
- [ ] Las listas muestran como máximo cinco prospectos frecuentes y diez solicitudes recientes con todos los campos requeridos.
- [ ] Las cotizaciones no guardadas o sin prospecto no aparecen ni afectan los resultados.
- [ ] Los casos de carga, ausencia de datos y error se muestran en español y fallan de forma visible ante una regresión.
- [ ] El flujo existente de cotización conserva su comportamiento y las pruebas pertinentes pasan.
