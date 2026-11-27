Type: task
ID: T003
Name: Validar integración del dashboard
Spec: 005-dashboard-de-metricas-de-solicitudes
Status: Completed
Date: 2026-11-26 16:15
Branch: task/005-t003-validar-integracion-del-dashboard
Depends on: T001, T002
Covers: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11

## Description
Completar la validación integrada del dashboard y del flujo existente. Las pruebas deben comprobar los datos persistidos, los límites por zona horaria, la presentación de estados y la ausencia de cambios en la cotización.

## To do
- [x] Agregar o ajustar pruebas unitarias y e2e pertinentes al agregado backend y a la navegación frontend, incluidos el dashboard inicial y el botón hacia la ruta de creación.
- [x] Preparar datos de prueba con cotizaciones guardadas de los tres tipos, asociadas y no asociadas a prospectos.
- [x] Verificar intervalos en zona horaria de México y persistencia en UTC.
- [x] Validar conteos, montos separados, listados, estados vacíos y errores desde la integración completa.
- [x] Verificar que el microservicio dashboard arranca en Compose y responde por el proxy frontend sin 502.
- [x] Confirmar que el flujo actual de creación y guardado de cotizaciones no se modifica.

## Test (acceptance criteria)
- [x] Las pruebas cubren correctamente el total y los desgloses de crédito simple, arrendamiento y MSI dentro de un intervalo seleccionado.
- [x] Los valores agregados coinciden con las cotizaciones persistidas asociadas a prospectos y tienen formato MXN de dos decimales.
- [x] Los últimos 30 días son el intervalo inicial y el filtro cambia métricas y gráficas sin cambiar los listados independientes.
- [x] Las listas muestran como máximo cinco prospectos frecuentes y diez solicitudes recientes con todos los campos requeridos.
- [x] Las cotizaciones no guardadas o sin prospecto no aparecen ni afectan los resultados.
- [x] Los casos de carga, ausencia de datos y error se muestran en español y fallan de forma visible ante una regresión.
- [x] La ruta inicial muestra el dashboard y su botón abre la ruta dedicada del cotizador.
- [x] El flujo existente de cotización conserva su comportamiento y las pruebas pertinentes pasan.
