Type: task
ID: T003
Name: Agregar acción de descarga en la interfaz
Spec: 002-descarga-de-cotizaciones-en-pdf
Status: pending
Date: 2026-11-09 18:16
Branch: task/002-t003-agregar-accion-de-descarga-en-la-interfaz
Depends on: T001, T002
Covers: R1, R5, R6

## Description
Este trabajo conecta el flujo de cotización con la descarga del PDF en la interfaz, mostrando la acción sólo cuando existe una cotización válida y manejando fallos con mensajes claros. La intención es que el usuario pueda descargar el archivo directamente y volver a intentar si ocurre un error.

## To do
- [ ] Mostrar la acción para descargar el PDF únicamente cuando ya exista una cotización válida.
- [ ] Invocar la descarga del PDF desde la interfaz y asegurar que el navegador lo descargue directamente.
- [ ] Manejar errores de generación o descarga con mensajes en español, manteniendo la cotización visible y permitiendo reintentos.

## Test (acceptance criteria)
- [ ] Un test valida que la acción de descarga no aparece antes de obtener una cotización válida.
- [ ] Un test confirma que la descarga exitosa inicia la descarga del archivo PDF directamente en el navegador.
- [ ] Un test verifica que una falla muestra mensaje entendible en español, conserva la cotización y permite intentar nuevamente.
