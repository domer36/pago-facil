Type: task
ID: T003
Name: Persistir cotizaciones
Spec: 003-persistencia-de-cotizaciones-y-prospectos
Status: Completed
Date: 2026-11-10 09:56
Branch: task/003-t003-persistir-cotizaciones
Depends on: T001, T002
Covers: R5, R6, R8

## Description
Esta tarea guarda explícitamente cada cotización calculada asociada a un prospecto registrado, conservando el resultado original sin reclacularlo ni alterarlo. La persistencia debe respetar la regla de negocio vigente y mantener la historia aunque un prospecto se dé de baja.

## To do
- [x] Definir el guardado explícito de la cotización en el backend de cotizaciones y su asociación con un prospecto registrado.
- [x] Persistir el identificador del prospecto, la entrada original y la respuesta calculada completa, incluida la tabla de amortización.
- [x] Asegurar que la baja lógica del prospecto no modifique ni elimine las cotizaciones ya guardadas.
- [x] Mantener la separación entre cálculo y almacenamiento para que los resultados guardados permanezcan inmutables.

## Test (acceptance criteria)
- [x] La cotización no se persiste hasta que el usuario solicita explícitamente Guardar.
- [x] Una cotización guardada conserva el prospecto asociado, las entradas y la respuesta completa con la tabla de amortización originales.
- [ ] La baja lógica de un prospecto no borra ni modifica la historia de cotizaciones asociadas previamente guardadas.
- [x] La operación de guardado conserva el resultado calculado sin recalcular ni alterar los datos persistidos.
