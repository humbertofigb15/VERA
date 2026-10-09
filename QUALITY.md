# Calidad de software y verificación operativa

## Propósito

VERA tiene backend Express y frontend React/Vite. `npm run quality` ejecuta una verificación reproducible de ambos componentes en desarrollo local y en GitHub Actions. El flujo no despliega ni modifica servicios externos.

El runner ejecuta todas las etapas aunque alguna falle para dejar un diagnóstico completo. El proceso termina con código distinto de cero si una o más etapas fallan; por eso GitHub marca el check como fallido y el PR conserva la evidencia de cada etapa.

## Ejecución local

Requisitos: Node.js 22 y npm. Instala las dependencias bloqueadas y corre el flujo desde la raíz:

```sh
npm ci --prefix backend
npm ci --prefix frontend
npm run quality
```

Para ejecutar una sola etapa:

```sh
npm run lint --prefix backend
npm run test:coverage --prefix backend
npm run audit --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
npm run audit --prefix frontend
```

## Gates y criterios de aprobación

| Etapa | Qué verifica | Criterio de aprobación |
|---|---|---|
| Sintaxis backend | Ejecuta `node --check` sobre todos los `.js` del backend; excluye dependencias instaladas y reportes. | Todos los archivos parsean correctamente. |
| Pruebas backend | Runner integrado `node:test`; prueba reglas de correo institucional, nombre, contraseña y estado de cuenta. | Cero pruebas fallidas. |
| Integración backend | Arranca la aplicación Express en un puerto efímero y solicita `GET /`. | HTTP 200 y respuesta JSON de salud esperada. No necesita Supabase ni secretos. |
| Cobertura | Node informa líneas, ramas y funciones instrumentadas al correr las pruebas. | Se reporta como señal; aún no hay umbral mínimo global. |
| ESLint frontend | Ejecuta la configuración ESLint existente sobre el frontend. | Cero errores de lint. |
| Build frontend | Compila el bundle de producción con Vite. | El build termina correctamente. El runner registra el tamaño JavaScript principal cuando Vite lo informa. |
| Auditoría npm | Audita dependencias directas y transitivas, de producción y desarrollo, en ambos lockfiles. | Cero vulnerabilidades altas o críticas (`npm audit --audit-level=high`). |

## Reporte por ejecución

El runner [`scripts/quality.js`](scripts/quality.js) registra inicio y fin UTC, commit de la rama, revisión probada por Actions, estado y duración de cada etapa y total. También resume cantidad de pruebas aprobadas/fallidas, cobertura backend, hallazgos npm y tamaño del bundle JavaScript cuando se puede extraer del build. En eventos de pull request, Actions prueba el candidato de merge y el reporte identifica también el commit fuente de la rama.

Genera estos archivos locales, ignorados por Git:

- `quality-report/quality-report.md`: resumen legible.
- `quality-report/quality-report.json`: datos estructurados para procesarlos después.

En GitHub Actions, el resumen Markdown aparece en la pestaña **Summary** del run y ambos archivos se guardan como artifact por 14 días, incluso si falla un gate. La duración corresponde a la ejecución observada; no es un presupuesto ni un SLO de producción.

## GitHub Actions

El workflow [`.github/workflows/quality.yml`](.github/workflows/quality.yml) corre en cada pull request hacia `main`, en cada push a `main` y bajo `workflow_dispatch`. Fija Ubuntu 24.04 y Node.js 22 para reducir deriva de entorno; usa instalaciones reproducibles con `npm ci`, límite máximo de 20 minutos, permisos `contents: read`, cancelación de ejecuciones obsoletas de la misma rama y acciones fijadas a SHA.

Un gate fallido hace fallar el job. El artifact permite revisar los tiempos y métricas de esa ejecución aunque el job falle. No se requieren secrets ni acceso de escritura al repositorio.

## Alcance y límites actuales

- La suite backend incluye pruebas unitarias y de integración HTTP con `node:test`: reglas de cuenta y contraseñas, riesgo/probabilidad/impacto, validación de propuestas, métricas/matriz/permisos del dashboard, prioridades de notificación, secreto JWT, registro/login/2FA, administración de usuarios y roles, bitácora filtrada por administrador, salud de la API, propuestas/aprobación/rechazo, riesgos, controles, evidencias referenciadas, notificaciones derivadas e historial/comentarios de propuestas. La matriz de los 78 casos recibidos y el estado de cobertura por requisito están en [`docs/testing/test-plan.md`](docs/testing/test-plan.md).
- Las pruebas de API existentes no equivalen a pruebas de extremo a extremo en navegador. Aún faltan matrices completas de autenticación/administración, navegadores y dispositivos, accesibilidad, carga/estrés y mediciones de disponibilidad.
- Los datos del prototipo se mantienen en memoria. Evidencias son referencias y metadatos, no archivos binarios. Las pruebas de persistencia, retención, restauración y carga de archivos requieren capacidades/ambientes adicionales.
- La cobertura se reporta como señal y no tiene umbral mínimo global. Primero se ampliará cobertura basada en comportamiento y se observará la línea base antes de proponer un umbral.
- La auditoría npm detecta vulnerabilidades publicadas en dependencias; no es un análisis de seguridad del código fuente.

El plan separa lo que puede ejecutarse automáticamente en PR de las validaciones que requieren staging, monitoreo mensual o revisión manual. Ningún caso se reporta como cubierto únicamente por estar planeado.

Estas métricas describen el commit y el entorno de una ejecución concreta. No equivalen a garantía de ausencia de defectos ni a un SLO operativo.
