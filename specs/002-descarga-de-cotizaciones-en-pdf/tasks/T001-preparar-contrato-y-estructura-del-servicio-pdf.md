Type: task
ID: T001
Name: Preparar contrato y estructura del servicio PDF
Spec: 002-descarga-de-cotizaciones-en-pdf
Status: in review
Date: 2026-11-09 18:16
Branch: task/002-t001-preparar-contrato-y-estructura-del-servicio-pdf
Depends on: -
Covers: R2, R8

## Description
Este trabajo prepara el servicio PDF para aceptar la respuesta calculada de cotización y deja una estructura extensible para futuros generadores. Se define la API y la organización del proyecto sin duplicar la lógica financiera ni cambiar las reglas de negocio.

## To do
- [x] Definir el endpoint y el payload del servicio PDF para recibir la cotización calculada.
- [x] Organizar el servicio en módulos o generadores que permitan sumar otros tipos de documentos sin afectar el alcance actual.
- [x] Añadir validaciones y pruebas para confirmar que la respuesta recibida se conserva sin recalcular importes financieros.

## Test (acceptance criteria)
- [x] Un caso de prueba valida que un payload de cotización válido es aceptado por el servicio PDF y devuelve un documento.
- [x] Una prueba confirma que los valores financieros del documento coinciden con la respuesta recibida y no se recalculan ni modifican.
- [x] Una prueba confirma que la estructura del servicio permite añadir otro generador sin romper la implementación actual.
