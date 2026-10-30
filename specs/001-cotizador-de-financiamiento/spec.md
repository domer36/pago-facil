Name: 001 Cotizador de Financiamiento
Status: Approved
Date: 2026-10-29 21:36

## Description
Aplicación web en español para cotizar crédito simple, arrendamiento y meses sin intereses (MSI). El usuario captura los datos del financiamiento y obtiene una tabla de amortización con el desglose de cada mensualidad. Todos los cálculos financieros se realizan en el backend y la aplicación se ejecuta localmente con Docker Compose.

## Goals
- Permitir cotizar los tres tipos de financiamiento con tasas fijas y reglas de cálculo definidas.
- Mostrar una tabla de amortización verificable, incluidos los totales y el residual cuando corresponda.
- Validar las entradas y rechazar combinaciones que no cumplan las reglas de esta especificación.
- Permitir iniciar la aplicación mediante Docker Compose.

## Out of scope
- Tasas variables o edición de las tasas por el usuario.
- Comisiones, impuestos, seguros u otros cargos adicionales.
- Autenticación, persistencia de cotizaciones e integraciones externas.
- Tipos de financiamiento distintos de crédito simple, arrendamiento y MSI.

## Requirements
- R1: La interfaz debe permitir seleccionar crédito simple, arrendamiento o MSI.
- R2: La interfaz debe solicitar el valor total en MXN, el porcentaje de pago inicial y un plazo seleccionado entre 6, 12, 18, 24, 36 o 48 meses.
- R3: Para arrendamiento, la interfaz debe solicitar además el porcentaje residual. No debe solicitar ni aplicar un residual para crédito simple o MSI.
- R4: El pago inicial debe ser un porcentaje entre 0% y 80%, inclusive. El monto financiado se calcula como el valor total menos el pago inicial.
- R5: El residual de arrendamiento debe ser un porcentaje entre 0% y 80%, inclusive, del valor total. El residual se liquida al final del plazo. La cotización debe rechazarse si el porcentaje de pago inicial más el porcentaje residual supera 100%.
- R6: El valor total debe ser mayor que cero y el monto financiado debe ser de al menos $50,000 MXN. Se deben rechazar valores que no sean válidos y plazos fuera de las opciones definidas.
- R7: El crédito simple debe usar una tasa anual fija de 35%, convertida a tasa mensual dividiéndola entre 12, y mensualidades fijas calculadas con el método francés.
- R8: El arrendamiento debe usar una tasa anual fija de 27%, convertida a tasa mensual dividiéndola entre 12, mensualidades fijas y el pago residual al final. El pago periódico debe amortizar el saldo financiado considerando el valor futuro del residual.
- R9: MSI debe usar tasa de interés de 0% y dividir el monto financiado en pagos iguales durante el plazo seleccionado.
- R10: Los cálculos financieros deben ejecutarse en el backend. El frontend debe presentar los errores de validación devueltos por el backend sin generar una cotización con datos inválidos.
- R11: La tabla debe incluir número de mensualidad, pago periódico, capital, interés y saldo pendiente. Para arrendamiento debe identificar además el pago residual final. La respuesta debe mostrar total pagado y total de intereses.
- R12: Los importes se deben presentar en MXN con dos decimales. Los cálculos deben conservar precisión completa hasta el redondeo de presentación y ajustar el último pago periódico para que el saldo amortizado cierre en cero, sin omitir el residual final cuando corresponda.
- R13: La aplicación debe poder iniciarse localmente mediante Docker Compose.

## Acceptance criteria
- [ ] Se puede seleccionar cada uno de los tres tipos y capturar los campos que corresponden; el campo residual aparece únicamente para arrendamiento.
- [ ] Los plazos disponibles son exactamente 6, 12, 18, 24, 36 y 48 meses.
- [ ] Una entrada con valor total mayor que cero y monto financiado de al menos $50,000 MXN genera una tabla con una fila por mensualidad y los datos requeridos.
- [ ] Crédito simple calcula pagos fijos con tasa anual de 35%; arrendamiento calcula pagos fijos con tasa anual de 27% y liquida el residual al final; MSI genera pagos iguales sin interés.
- [ ] Los porcentajes fuera del rango 0%–80%, una suma de pago inicial y residual mayor a 100%, un valor total no positivo o un monto financiado menor a $50,000 MXN son rechazados con un error visible al usuario.
- [ ] Los importes se muestran en MXN con dos decimales y el saldo amortizado queda en cero tras el último pago periódico, con el residual separado e identificado cuando corresponda.
- [ ] La aplicación se inicia localmente con Docker Compose y las cotizaciones se calculan en el backend.

## Technical notes
Aplicación web con frontend y backend; todos los cálculos financieros deben ejecutarse en el backend. Tasas anuales nominales fijas: 35% para crédito simple, 27% para arrendamiento y 0% para MSI; la tasa mensual se obtiene dividiendo la tasa anual entre 12. Para pagos fijos con tasa mensual positiva y valor residual futuro, el pago periódico debe amortizar el valor presente financiado menos el valor presente del residual. Moneda: MXN. La aplicación no requiere autenticación, persistencia ni integraciones externas. Debe ejecutarse con Docker Compose.

## Open questions
- Selección de lenguaje, framework y tecnologías concretas para frontend y backend.

## Proposed tasks
Outline only; the task files are created later by create-tasks.
- T001 - Implementar cálculo financiero: calcular y validar crédito simple, arrendamiento y MSI en el backend, con pruebas de reglas y redondeo.
- T002 - Crear interfaz del cotizador: capturar entradas, mostrar validaciones y presentar la tabla de amortización y sus totales.
- T003 - Preparar ejecución local: configurar Docker Compose y verificar el inicio integrado de frontend y backend.
