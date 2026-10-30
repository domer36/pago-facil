Type: task
ID: T001
Name: Implementar cálculo financiero en NestJS
Spec: 001-cotizador-de-financiamiento
Status: pending
Date: 2026-10-30 13:19
Branch: task/001-t001-calculo-financiero-nestjs
Depends on: -
Covers: R3, R4, R5, R6, R7, R8, R9, R10, R11, R12

## Description
Implementar en el backend NestJS el endpoint y la lógica que validan una solicitud de cotización y calculan crédito simple, arrendamiento o MSI. La respuesta debe incluir el desglose de amortización, los totales y el residual separado cuando corresponda, conservando precisión hasta el redondeo de presentación. Este contrato será consumido por la interfaz Angular.

## To do
- [ ] Definir el contrato de solicitud y respuesta, junto con la validación de tipo, valor, porcentajes y plazos permitidos.
- [ ] Implementar los cálculos de crédito simple, arrendamiento con residual y MSI, incluidos saldos, intereses, totales y ajuste del último pago periódico.
- [ ] Añadir pruebas automatizadas para las reglas financieras, entradas inválidas y estructura de la respuesta.

## Test (acceptance criteria)
- [ ] Las pruebas verifican las tasas y pagos de los tres tipos, con una fila por mensualidad y residual final separado para arrendamiento.
- [ ] Las solicitudes con porcentajes fuera de rango, suma de enganche y residual superior a 100%, valor no positivo, plazo no permitido o monto financiado menor a $50,000 MXN son rechazadas.
- [ ] Las pruebas confirman que el saldo amortizado cierra en cero tras el último pago periódico y que la respuesta expone importes, total pagado y total de intereses.
