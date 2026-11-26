Type: task
ID: T001
Name: Proveer métricas agregadas en backend
Spec: 005-dashboard-de-metricas-de-solicitudes
Status: pending
Date: 2026-11-26 16:15
Branch: task/005-t001-proveer-metricas-agregadas-en-backend
Depends on: -
Covers: R2, R3, R4, R5, R7, R8, R10

## Description
Agregar al backend los endpoints o consultas necesarias para devolver datos agregados de cotizaciones guardadas y asociadas a prospectos. Las fechas persistidas siguen almacenándose en UTC, mientras que los límites del filtro del dashboard se interpretan en la zona horaria de México. Debera estar en un nuevo microservicio *dashboard*.

## To do
- [ ] Crear microservicio dashboard para estos endpoints.
- [ ] Diseñar la entrada del intervalo de fechas y una respuesta que separe conteos totales y por tipo de financiamiento.
- [ ] Agregar agregaciones de valor total cotizado y monto financiado por el intervalo y por tipo.
- [ ] Consultar hasta cinco prospectos frecuentes por cotizaciones guardadas asociadas durante los últimos 30 días.
- [ ] Consultar hasta diez solicitudes guardadas más recientes con prospecto, tipo y valor total.
- [ ] Excluir cotizaciones no guardadas y cotizaciones sin prospecto en todas las consultas agregadas.
- [ ] Convertir los límites recibidos a UTC sin cambiar las fechas persistidas y documentar el comportamiento de zona horaria.
- [ ] Exponer una representación estable de errores de consulta, sin responder métricas de cero ante fallos.

## Test (acceptance criteria)
- [ ] Las pruebas de agregación devuelven conteos correctos y totales separados de valor total cotizado y monto financiado para los tres tipos.
- [ ] Una cotización no guardada o sin prospecto no afecta ningún agregado ni aparece en los listados.
- [ ] Los límites de un día calculados en zona horaria de México producen el intervalo UTC esperado en persistencia.
- [ ] Los prospectos frecuentes contienen máximo cinco elementos de los últimos 30 días y se independizan del intervalo filtrable.
- [ ] Las solicitudes recientes contienen máximo diez elementos con fecha UTC, prospecto, tipo y valor total, sin depender del intervalo filtrable.
- [ ] Ante un fallo de consulta, el backend devuelve un error comprensible y no una respuesta exitosa con métricas en cero.
