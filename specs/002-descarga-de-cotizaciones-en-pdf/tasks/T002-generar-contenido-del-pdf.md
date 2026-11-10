Type: task
ID: T002
Name: Generar contenido del PDF con tabla de amortización
Spec: 002-descarga-de-cotizaciones-en-pdf
Status: pending
Date: 2026-11-09 18:16
Branch: task/002-t002-generar-contenido-del-pdf
Depends on: T001
Covers: R2, R3, R4

## Description
Este trabajo genera el contenido del documento en español con formato A4, incluyendo la fecha de emisión, los datos de la cotización y la amortización completa. Para arrendamiento, el residual se imprime y liquida por separado, manteniendo los valores financieros como fuente de verdad.

## To do
- [ ] Diseñar el layout del PDF con idioma español, tamaño A4 y fecha de generación.
- [ ] Incluir los datos de entrada, el resumen financiero y todas las filas de amortización en el documento.
- [ ] Incorporar el tratamiento especial del residual final para arrendamiento y validar el resultado con pruebas.

## Test (acceptance criteria)
- [ ] Un test valida que un PDF de crédito simple, arrendamiento y MSI incluye datos de entrada, resumen y tabla completa de amortización.
- [ ] Un test confirma que el residual final en arrendamiento aparece separado del pago periódico y no se mezcla con la amortización.
- [ ] Un test verifica que el documento usa español, página A4 y la fecha de generación correcta.
