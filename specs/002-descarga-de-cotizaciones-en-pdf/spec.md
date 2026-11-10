Name: 002 Descarga de Cotizaciones en PDF
Status: Approved
Date: 2026-11-09 18:10

## Description
Esta especificación define la generación y descarga de la cotización vigente como un archivo PDF. El documento se genera a partir de la respuesta financiera ya calculada por el backend de cotizaciones, sin duplicar la lógica financiera. El servicio generador de PDF se ejecutará junto con la aplicación mediante Docker Compose y su organización debe permitir incorporar otros tipos de documentos en el futuro, sin generarlos en este alcance.

## Goals
- Permitir descargar desde la interfaz una cotización válida como PDF.
- Presentar en el PDF los datos y resultados de la cotización, incluidos los detalles de amortización y el residual cuando corresponda.
- Integrar el servicio generador de PDF en el entorno local de Docker Compose.
- Mantener una separación que facilite agregar otros documentos en el futuro sin implementarlos ahora.

## Out of scope
- Guardar cotizaciones, consultar un historial o persistir documentos.
- Generar documentos distintos de la cotización.
- Cambiar las reglas, validaciones o cálculos financieros definidos en `001-cotizador-de-financiamiento`.
- Añadir branding, logotipos o datos de una empresa.

## Requirements
- R1: La interfaz debe ofrecer una acción para descargar el PDF únicamente después de que se haya obtenido una cotización válida.
- R2: Para generar el documento, el frontend debe enviar al servicio PDF la respuesta calculada de cotización. El servicio PDF debe presentar los valores recibidos sin volver a calcular ni modificar los importes financieros.
- R3: El PDF debe incluir los datos de entrada de la cotización, un resumen financiero y la tabla completa de amortización. Para arrendamiento debe identificar además el pago residual final por separado.
- R4: El PDF debe estar en español, usar tamaño de página A4 e incluir la fecha de generación. No debe requerir branding especial.
- R5: Al solicitar una descarga válida, el navegador debe descargar directamente el archivo PDF.
- R6: Si falla la generación o descarga, la interfaz debe conservar visible la cotización, mostrar un mensaje entendible en español y permitir reintentar la descarga.
- R7: El servicio generador de PDF debe formar parte de Docker Compose y poder ejecutarse en conjunto con el frontend y el backend existentes.
- R8: La organización del servicio PDF debe permitir agregar generadores para otros tipos de documentos sin cambiar el alcance actual ni generar dichos documentos.

## Acceptance criteria
- [ ] Después de generar una cotización válida, aparece una acción que permite descargarla; no aparece antes de obtenerla.
- [ ] Se puede generar y descargar un PDF en español y tamaño A4 para crédito simple, arrendamiento y MSI.
- [ ] El PDF incluye los datos de entrada, el resumen, todas las filas de amortización y, para arrendamiento, el residual final separado; también incluye la fecha de generación.
- [ ] Los valores financieros del documento coinciden con la respuesta de cotización recibida y no son recalculados ni modificados por el servicio PDF.
- [ ] Una falla al generar o descargar el archivo muestra un error entendible, conserva la cotización y permite reintentar.
- [ ] Docker Compose inicia el servicio PDF junto con los servicios existentes y la interfaz puede comunicarse con él para descargar el documento.
- [ ] El alcance implementado no guarda cotizaciones ni genera otros tipos de documentos.

## Technical notes
El proyecto dispone de `backend/pdf-generator` para el servicio generador de PDF; debe integrarse con el frontend Angular y el backend de cotizaciones existentes. La API y el formato de archivo se definirán durante la implementación, manteniendo la respuesta calculada de cotización como fuente de los valores financieros. Docker Compose debe permitir la comunicación necesaria entre la interfaz y el servicio PDF.

## Open questions
- Ninguna sobre el alcance funcional. El nombre del archivo y los detalles del contrato HTTP se definirán durante la implementación.

## Tasks
- [ ] [T001 - Preparar contrato y estructura del servicio PDF](tasks/T001-preparar-contrato-y-estructura-del-servicio-pdf.md)
- [ ] [T002 - Generar contenido del PDF con tabla de amortización](tasks/T002-generar-contenido-del-pdf.md)
- [ ] [T003 - Agregar acción de descarga en la interfaz](tasks/T003-agregar-accion-de-descarga-en-la-interfaz.md)
- [ ] [T004 - Integrar servicio PDF en Docker Compose](tasks/T004-integrar-servicio-pdf-en-docker-compose.md)
