Type: task
ID: T002
Name: Crear dashboard en frontend
Spec: 005-dashboard-de-metricas-de-solicitudes
Status: Completed
Date: 2026-11-26 16:15
Branch: task/005-t002-crear-dashboard-en-frontend
Depends on: T001
Covers: R1, R3, R6, R9, R11

## Description
Crear la vista de dashboard en español y conectarla con la interfaz existente sin alterar el flujo de cotización. La vista debe presentar los datos agregados recibidos, ofrecer el filtro inicial de los últimos 30 días y mantener estados visuales claros.

## To do
- [x] Integrar una ruta o navegación desde la interfaz existente hacia el dashboard.
- [x] Agregar un filtro de intervalo con los últimos 30 días como selección inicial y enviar sus límites al backend.
- [x] Crear presentaciones separadas para conteos, valor total cotizado y monto financiado en general y por tipo.
- [x] Incorporar gráficas animadas e interactivas de solicitudes y montos por tipo, con cifras exactas accesibles además del efecto visual.
- [x] Mostrar prospectos frecuentes y solicitudes recientes con sus propios periodos independientes del filtro.
- [x] Implementar estados de carga, ausencia de resultados y error en métricas, gráficas y listados.
- [x] Mantener la presentación en español, el formato visual existente y los importes en MXN con dos decimales.

## Test (acceptance criteria)
- [ ] El dashboard es accesible desde la interfaz y las rutas existentes de cotización siguen utilizables.
- [x] Al abrirlo, el filtro comprende los últimos 30 días y al cambiarlo solicita y presenta métricas y gráficas actualizadas.
- [ ] Las gráficas muestran conteos y montos por tipo con interacción o detalle exacto y siguen siendo legibles sin depender de la animación.
- [ ] Prospectos frecuentes y solicitudes recientes no cambian al modificar el filtro de fechas.
- [x] La carga, ausencia de datos y errores se muestran en español y un error nunca se representa como cero o éxito.
- [ ] Los importes se presentan separados y con formato MXN de dos decimales sin que el frontend calcule valores financieros.
