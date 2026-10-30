Type: task
ID: T002
Name: Implementar interfaz Angular del cotizador
Spec: 001-cotizador-de-financiamiento
Status: Completed
Date: 2026-10-30 13:19
Branch: task/001-t002-interfaz-angular-cotizador
Depends on: T001
Covers: R1, R2, R3, R10, R11, R12

## Description
Implementar en Angular la captura de datos y presentación de cotizaciones mediante el contrato del backend. La interfaz debe mostrar el campo residual únicamente para arrendamiento, presentar claramente los errores devueltos por el backend y mostrar la tabla, los totales y el residual en MXN.

## To do
- [x] Crear el formulario con los tres tipos de financiamiento, los plazos permitidos y los campos condicionales correspondientes.
- [x] Conectar el formulario al endpoint NestJS y representar errores de validación sin mostrar una cotización inválida.
- [x] Presentar las mensualidades, saldos, totales y residual de arrendamiento con formato MXN de dos decimales.
- [x] Añadir pruebas automatizadas para el formulario, el manejo de errores y la presentación de resultados.

## Test (acceptance criteria)
- [x] Las pruebas verifican que el campo residual aparece únicamente al seleccionar arrendamiento y que los plazos ofrecidos son exactamente 6, 12, 18, 24, 36 y 48 meses.
- [x] Una respuesta válida del backend se representa con las columnas requeridas, totales y formato MXN de dos decimales; el residual se identifica separadamente para arrendamiento.
- [x] Un error de validación del backend se muestra al usuario y no deja visible una cotización generada con datos inválidos.
