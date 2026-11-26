Name: 005 Dashboard de Métricas de Solicitudes
Status: Approved
Date: 2026-11-26 16:08

## Description
Esta especificación agrega al cotizador un dashboard en español para consultar métricas de las cotizaciones guardadas y asociadas a prospectos. Presenta solicitudes y montos por tipo de financiamiento, prospectos frecuentes y solicitudes recientes, en una experiencia visual coherente con el resto de la aplicación. Por el momento, cualquier usuario de la aplicación puede consultar el dashboard.

## Goals
- Consultar la cantidad de solicitudes guardadas de crédito simple, arrendamiento y MSI.
- Consultar por separado el valor total cotizado y el monto financiado, tanto en el conjunto como por tipo de financiamiento.
- Identificar prospectos frecuentes y consultar las solicitudes guardadas más recientes.
- Integrar el dashboard con la aplicación existente sin cambiar el flujo de cotización.

## Out of scope
- Autenticación, permisos y segmentación de solicitudes por usuario; se consideran una posible evolución posterior.
- Mostrar cotizaciones no guardadas o cotizaciones que no estén asociadas a un prospecto.
- Editar o eliminar cotizaciones o prospectos desde el dashboard.
- Cambiar cálculos, validaciones, tasas, persistencia o reglas financieras existentes.

## Requirements
- R1: La aplicación debe ofrecer una vista de dashboard en español accesible desde la interfaz existente, conservando el flujo actual de cotización.
- R2: Las métricas del dashboard deben basarse únicamente en cotizaciones guardadas y asociadas a un prospecto.
- R3: El dashboard debe mostrar métricas para un intervalo de fechas seleccionable, con los últimos 30 días como intervalo inicial. El filtro debe afectar las métricas y gráficas, no las secciones de prospectos frecuentes y solicitudes recientes.
- R4: El dashboard debe mostrar el número de solicitudes dentro del intervalo seleccionado, desglosado por crédito simple, arrendamiento y MSI, además del total.
- R5: El dashboard debe mostrar, por separado, la suma del valor total cotizado y la suma del monto financiado dentro del intervalo seleccionado, tanto en el total general como desglosadas por tipo de financiamiento. Los importes deben presentarse en MXN con dos decimales.
- R6: Las gráficas deben visualizar las métricas de solicitudes y montos por tipo de financiamiento. Deben incluir transiciones animadas e interacciones que permitan consultar los valores exactos, conservando la legibilidad y el acceso a los datos sin depender exclusivamente del efecto visual. No se requiere comparación WoW semanal.
- R7: La sección de prospectos frecuentes debe mostrar hasta cinco prospectos, ordenados por cantidad de cotizaciones guardadas asociadas durante los últimos 30 días, sin depender del filtro de fechas del dashboard.
- R8: La sección de solicitudes recientes debe mostrar hasta diez cotizaciones guardadas más recientes, sin depender del filtro de fechas. Cada elemento debe incluir fecha de guardado, nombre del prospecto, tipo de financiamiento y valor total cotizado.
- R9: Las métricas, gráficas y listados deben presentar estados comprensibles de carga, ausencia de resultados y error. Un error de consulta no debe presentarse como una respuesta exitosa ni como métricas de cero.
- R10: Los datos agregados deben obtenerse de la persistencia existente mediante el backend. El frontend debe presentar los datos recibidos y no recalcular montos financieros.
- R11: La presentación debe conservar el idioma español, la legibilidad y la coherencia visual con el resto de la aplicación, incluso cuando las gráficas utilicen animación o interacción.

## Acceptance criteria
- [ ] Se puede acceder al dashboard desde la aplicación sin impedir el uso del flujo existente de cotización.
- [ ] Con cotizaciones guardadas asociadas a prospectos de los tres tipos de financiamiento, las métricas muestran los conteos correctos por tipo y el total.
- [ ] Para un intervalo seleccionado, los valores agregados de valor total cotizado y monto financiado coinciden con las cotizaciones guardadas asociadas a prospectos dentro de ese intervalo; ambos importes aparecen separados, en total y por tipo, con formato MXN de dos decimales.
- [ ] Al abrir el dashboard, el intervalo inicial comprende los últimos 30 días. Al cambiar el intervalo, las métricas y gráficas se actualizan, pero las secciones de prospectos frecuentes y solicitudes recientes mantienen sus periodos definidos.
- [ ] Las gráficas representan conteos y montos por tipo, ofrecen transiciones e interacción para consultar cifras exactas, y los datos siguen siendo comprensibles sin depender de la animación.
- [ ] La lista de prospectos frecuentes muestra como máximo cinco prospectos con más cotizaciones guardadas asociadas en los últimos 30 días.
- [ ] La lista de solicitudes recientes muestra como máximo diez cotizaciones guardadas más recientes y, para cada una, fecha, prospecto, tipo de financiamiento y valor total cotizado.
- [ ] Una cotización no guardada o no asociada a un prospecto no cambia las métricas ni aparece en los listados.
- [ ] Cuando no hay datos o falla la consulta, el dashboard muestra el estado correspondiente en español y no presenta el error como métricas válidas de cero.
- [ ] Los montos mostrados corresponden a los valores persistidos de las cotizaciones; el frontend no duplica los cálculos financieros.

## Technical notes
El frontend existente usa Angular y el backend de cotizaciones usa NestJS. Se deben reutilizar las cotizaciones y relaciones con prospectos persistidas según la especificación 003. El backend debe proporcionar los agregados necesarios; el frontend se encarga de filtros, gráficas y presentación. No se prescribe una biblioteca de gráficas. La experiencia visual solicitada como «WoW» significa gráficas animadas e interactivas con detalles visuales cuidados, no una comparación semana contra semana.

## Open questions
- Confirmar qué zona horaria debe determinar los límites de fecha al filtrar y ordenar cotizaciones.

## Tasks
- [ ] [T001 - Proveer métricas agregadas en backend](tasks/T001-proveer-metricas-agregadas-en-backend.md)
- [ ] [T002 - Crear dashboard en frontend](tasks/T002-crear-dashboard-en-frontend.md)
- [ ] [T003 - Validar integración del dashboard](tasks/T003-validar-integracion-del-dashboard.md)
