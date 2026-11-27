# Guía para asistentes de código

## Contexto del proyecto

Cotizador web en español para crédito simple, arrendamiento y meses sin
intereses (MSI). La especificación funcional vigente está en
[`specs/001-cotizador-de-financiamiento/spec.md`](specs/001-cotizador-de-financiamiento/spec.md);
consúltala antes de cambiar reglas de negocio. El proyecto sigue SDD: requisitos
en `specs/`, trabajo dividido en `specs/*/tasks/`.

## Arquitectura

- `frontend/webapp`: aplicación Angular servida por Nginx. Nginx enruta
  `/quotes` a `backend`, `/customers` a `customers` y `/documents/` a
  `pdf-generator`, además de `/dashboard` a `dashboard`; el acceso local es
  `http://localhost:4200`.
- `backend/quote-generator`: API NestJS para calcular y guardar cotizaciones.
  Su código está organizado por funcionalidad (`src/features/quotes/`) en
  dominio, aplicación, infraestructura y presentación.
- `backend/customers`: API NestJS para administrar y buscar prospectos; sigue
  la misma separación por capas y funcionalidad.
- `backend/pdf-generator`: API NestJS para generar documentos de cotización,
  organizada en la funcionalidad `documents`.
- `database`: migraciones SQL de Flyway para PostgreSQL. Actualmente los
  servicios `backend` y `customers` usan la instancia y el esquema compartidos;
  `pdf-generator` no tiene conexión configurada a la base de datos.
- `compose.yaml`: orquesta PostgreSQL, la ejecución de migraciones Flyway, las
  tres APIs y el frontend dentro de la red de Compose. Los servicios se
  comunican usando sus nombres de servicio; publica puertos al host solo cuando
  sea necesario para el desarrollo o acceso externo.

Mantén la lógica financiera y la validación autoritativa en el backend. El
frontend recopila datos, invoca el gateway HTTP y presenta la respuesta y los
errores recibidos; no dupliques allí los cálculos financieros.

## Microservicios y Docker Compose

- Los servicios de backend nuevos deben ser aplicaciones NestJS independientes,
  creadas bajo `backend/<nombre-del-servicio>` y con su propio `package.json`,
  lockfile, configuración Nest/TypeScript, pruebas y `Dockerfile`. Mantén las
  convenciones de capas y formato de los servicios existentes; no agregues otro
  framework o runtime para un microservicio nuevo.
- Mantén cada servicio enfocado en su responsabilidad y expón su funcionalidad
  mediante una API explícita. No importes directamente código interno de otro
  servicio; integra servicios por HTTP u otro contrato explícito cuando sea
  necesario.
- Agrega cada servicio a `compose.yaml` con el contexto de build correcto, su
  puerto de aplicación y las dependencias de arranque necesarias. Usa
  `expose` para comunicación interna y `ports` solo si hace falta acceder desde
  el host. Si el frontend debe consumirlo, agrega la ruta correspondiente en
  `frontend/webapp/nginx.conf` y usa una URL relativa desde Angular.
- Los upstreams de Docker en Nginx deben resolverse dinámicamente usando el DNS
  interno de Compose (`resolver 127.0.0.11`) y una variable en `proxy_pass`.
  No uses nombres de servicios directamente en `proxy_pass`: Nginx los resuelve
  al iniciar y puede abortar el arranque del frontend si un servicio todavía no
  está disponible, como ocurrió al agregar el upstream `dashboard`. Al cambiar
  rutas proxy, verifica la sintaxis con `docker compose build frontend` y
  `docker run --rm paga-facil-frontend nginx -t`, además de `docker compose
  config --quiet`.
- Configura las dependencias de salud/arranque según lo que el servicio
  realmente necesita. Si conecta a PostgreSQL, usa el hostname `postgres` y
  las variables de entorno existentes; espera a que PostgreSQL esté saludable y
  a que Flyway termine correctamente cuando necesite el esquema migrado.
- No copies secretos ni credenciales reales a código, Dockerfiles o archivos
  versionados. Usa variables de entorno y conserva valores locales de ejemplo
  seguros.

## Base de datos y migraciones

- PostgreSQL es la base de datos actual. Todas las modificaciones de esquema
  deben ser migraciones SQL versionadas de Flyway en `database/migrations/`,
  con el formato `V<numero>__<descripcion_en_snake_case>.sql` (por ejemplo,
  `V2__add_prospect_status.sql`). Usa un número de versión nuevo y único,
  posterior a las migraciones existentes.
- Flyway aplica las migraciones desde el servicio `flyway` de Compose antes de
  iniciar los servicios que dependen del esquema. No cambies el esquema
  manualmente ni uses sincronización automática del esquema desde una API.
- Una migración que ya se aplicó en un entorno compartido o desplegado es
  inmutable: no la edites ni la renombres. Corrige el esquema con una migración
  nueva. Diseña los cambios como evoluciones compatibles cuando sea posible
  (agregar y poblar antes de retirar o renombrar datos) para permitir despliegues
  coordinados.
- Ten presente que las migraciones actuales se ejecutan contra una base y un
  esquema compartidos por `backend` y `customers`. Coordina cambios entre ambos
  y no asumas que cada servicio tiene una base aislada. Si se propone separar
  bases o esquemas, actualiza primero el diseño, la configuración, las
  migraciones y las instrucciones operativas afectadas.
- Revisa tanto el SQL como el comportamiento de los servicios que usan las
  tablas modificadas. Verifica el arranque integrado con `docker compose up
  --build` y revisa los logs de `flyway` y de los servicios afectados.

## Reglas de negocio que no se deben cambiar incidentalmente

- Crédito simple: tasa anual fija de 35%; arrendamiento: 27%; MSI: 0%. Las tasas
  positivas se convierten a tasa mensual dividiendo entre 12.
- Los plazos permitidos son 6, 12, 18, 24, 36 o 48 meses.
- El valor total debe ser positivo y el monto financiado de al menos $50,000
  MXN. Pago inicial y residual (solo arrendamiento) deben estar entre 0% y 80%;
  su suma no puede superar 100%.
- Los importes se presentan en MXN con dos decimales. Conserva precisión en los
  cálculos y ajusta el último pago periódico para cerrar el saldo; el residual
  de arrendamiento se informa y liquida por separado.

La especificación es la fuente de verdad completa, incluidos los campos de la
respuesta y criterios de aceptación.

## Desarrollo y validación

Para desarrollo integrado, desde la raíz:

```bash
docker compose up --build
```

Para validar cambios en un solo componente, ejecuta desde la raíz los comandos
del componente afectado:

```bash
# API de cotizaciones
(cd backend/quote-generator && npm test && npm run test:e2e && npm run lint && npm run build)

# API de prospectos
(cd backend/customers && npm test && npm run test:e2e && npm run lint && npm run build)

# API de documentos
(cd backend/pdf-generator && npm test && npm run test:e2e && npm run lint && npm run build)

# API del dashboard
(cd backend/dashboard && npm test && npm run test:e2e && npm run lint && npm run build)

# Frontend
(cd frontend/webapp && npm test && npm run build)
```

Las APIs NestJS usan Vitest para pruebas unitarias y e2e; el frontend ejecuta
sus pruebas unitarias con Angular/Vitest. Ejecuta las pruebas pertinentes a los
servicios y capas afectados y no afirmes que pasaron si no las ejecutaste.

## Flujo de trabajo

- Para funcionalidad nueva o cambios de alcance, revisa y actualiza la
  especificación y las tareas SDD correspondientes antes de implementar.
- Las instrucciones específicas de un componente complementan esta guía;
  léelas antes de cambiar ese componente.
- Conserva el idioma español de la interfaz y los mensajes orientados al usuario.
- Evita añadir dependencias si la solución puede seguir los patrones existentes.
