# Plan integral de pruebas de VERA

## Objetivo y alcance

Este plan convierte los 78 casos de prueba recibidos en un programa verificable. Distingue pruebas unitarias, de integración HTTP, de interfaz, de compatibilidad, de carga y verificaciones operativas. Un caso no se considera aprobado por existir en este catálogo: debe ejecutarse en el nivel indicado y conservar evidencia.

La línea base del repositorio es un prototipo React/Vite y Express. Incluye 18 pruebas automatizadas con `node:test`, entre ellas pruebas unitarias de reglas de cuenta e integración HTTP para riesgos, controles, propuestas, notificaciones, historial, evidencias y panel. Varias pruebas cubren solo APIs. Los datos de dominio residen en memoria; evidencia significa referencias y metadatos, no archivos binarios. Por eso las verificaciones de persistencia, carga de archivos y operación de producción no se pueden declarar cubiertas hoy.

## Secuencia propuesta de pull requests

Los PRs se preparan y se integran en este orden, uno a la vez, con base actualizada desde `main`:

| PR | Alcance | Entrega verificable |
|---|---|---|
| 1 | Catálogo, trazabilidad, criterios, datos ficticios y definición de niveles de prueba. | Este plan y matriz TC/RF/RNF revisada. |
| 2 | Registro y administración de usuarios, autenticación, sesión, bloqueo, contraseñas, 2FA y permisos. | Pruebas unitarias de reglas más pruebas HTTP negativas y positivas por rol. |
| 3 | Ciclo de auditoría, propuestas, riesgos, evaluaciones, controles, hallazgos y planes de acción. | Pruebas unitarias de reglas/transiciones y pruebas de integración de API. |
| 4 | Evidencias, notificaciones, historial, comentarios y trazabilidad. | Pruebas HTTP de alcance, validación y eventos; prueba de carga binaria solo si se implementa esa capacidad. |
| 5 | Panel, actividad reciente, filtros, búsquedas, reportes y exportaciones. | Pruebas de servicio/API y de interfaz para filtros, resultados vacíos y permisos. |
| 6 | Flujos web, navegadores, tamaños de pantalla, accesibilidad y usabilidad. | E2E automatizadas en Chrome, Edge y Firefox; emulación de móvil/tablet y revisión manual de hardware real. |
| 7 | Concurrencia, rendimiento y controles operativos/de plataforma. | Carga repetible en staging y evidencia manual/monitoreada para TLS, disponibilidad, respaldo, restauración, escalamiento, privacidad y cumplimiento. |

Cada PR debe incluir solo pruebas de comportamiento que correspondan a funciones existentes. Si el requisito depende de una función ausente, el caso queda como bloqueado/pending con el prerrequisito explícito; no se agrega una prueba que simule un resultado aún no ofrecido por VERA.

## Niveles de prueba

- **Unitarias:** reglas puras, validaciones, permisos y transiciones; rápidas, deterministas y sin red/servicios externos.
- **Integración API:** servidor Express con datos de prueba aislados; valida HTTP, autenticación, autorización, contratos y eventos.
- **E2E/UI:** navegación real por la aplicación, acciones y estados visibles. No sustituye las pruebas de API.
- **Compatibilidad/responsividad:** matriz de navegador y viewport; cualquier emulación se registra como emulación, no como dispositivo físico.
- **Carga/rendimiento:** ejecución en ambiente de pruebas aislado con datos y perfil de carga documentados. No ejecutar contra producción desde el CI de cada PR.
- **Operativas/manuales:** despliegue TLS, disponibilidad mensual, restauración de respaldos, escalamiento, revisión normativa y alineación IIA. Adjuntar fecha, ambiente, pasos, resultado y responsable de la verificación.

## Criterios de entrada

1. La funcionalidad objeto de prueba existe y está desplegada en el ambiente elegido.
2. Los requisitos y resultados esperados están acordados; los casos tienen precondiciones, pasos y datos ficticios.
3. El ambiente está disponible y aislado de usuarios/datos reales.
4. Las cuentas de prueba cubren roles y estados pertinentes; las credenciales/secrets no se guardan en Git.
5. La herramienta y versión, navegador/dispositivo, semilla y configuración están registradas para que la corrida sea repetible.

## Criterios de salida

1. Se ejecutaron los casos implementados y elegibles del alcance; los bloqueados se identifican con causa y dueño.
2. Se conservan resultados por caso, commit, ambiente, herramienta, fecha/hora, duración, fallos y evidencia relevante.
3. No quedan defectos críticos abiertos sin aceptación y seguimiento registrados.
4. Las correcciones tienen re-ejecución de caso y regresión relacionada.
5. La matriz TC/RF/RNF refleja el estado real, con vínculo a archivos de prueba o evidencia manual.

## Prioridad y criterios no funcionales

La prioridad inicial respeta la evaluación de riesgo entregada: alta para autenticación/roles/permisos, ciclo de auditoría y estados/riesgos, además de concurrencia; media para evidencia/notificaciones, búsqueda/filtros/exportación y compatibilidad. Seguridad de acceso permanece alta aunque una pantalla particular esté clasificada como funcional.

Para concurrencia se recomienda ejecutar primero 150 usuarios simultáneos y luego una carga escalonada de 250 o más. El documento pide respuesta no mayor a 1.5 s; para evitar que un promedio oculte lentitud, el PR-7 debe acordar si el umbral se mide como p95, máximo u otra estadística, junto con tasa de error, duración, ramp-up y perfil de operaciones. No se presenta una meta de producción hasta tener ambiente representativo y una línea base.

La disponibilidad de 99.5% requiere una ventana de medición mensual; RTO de 4 horas se demuestra con simulacro de recuperación; respaldo diario requiere historial de jobs y restauración; crecimiento/escalamiento necesitan infraestructura configurada. WCAG AA requiere herramienta automática más revisión manual de teclado/lector; la herramienta por sí sola no certifica conformidad. Privacidad e IIA requieren revisión de responsables competentes y criterios normativos aplicables.

## Matriz de trazabilidad y estado de línea base

**Estado:** “Parcial” significa que el repositorio tiene pruebas relacionadas, pero no cubren todo el escenario de usuario/requisito. “Pendiente” significa que falta automatización/evidencia o no hay función implementada. “Bloqueado” significa que la prueba requiere una capacidad o ambiente que hoy no está disponible. El estado no es un resultado de ejecución.

| Caso | Requisito / escenario | Tipo principal | Prioridad | PR | Línea base |
|---|---|---|---|---:|---|
| TC-01 | RF-01: correo institucional duplicado | Unit/API | Alta | 2 | Cubierto por API: duplicado activo y dirección asociada a cuenta deshabilitada devuelve conflicto |
| TC-02 | RF-01: cuenta eliminada o bloqueada | API | Alta | 2 | Parcial: no permite reutilizar correo de una cuenta deshabilitada; política de re-registro tras rechazo por confirmar |
| TC-03 | RF-03: acceso correcto | API/E2E | Alta | 2 | Cubierto por API: token firmado, identidad/rol y sesión protegida; registro externo sustituido por test double |
| TC-04 | RF-03: credenciales inexistentes | API | Alta | 2 | Cubierto por API: respuesta 401 |
| TC-05 | RF-03: cuenta deshabilitada | API | Alta | 2 | Cubierto por API: respuesta 403 |
| TC-06 | RF-04: cinco intentos fallidos y bloqueo | Unit/API | Alta | 2 | Cubierto por API: quinto fallo bloquea, emite Retry-After y el bloqueo continúa |
| TC-07 | RF-09: actividad reciente tras crear auditoría | API/UI | Media | 5 | Parcial: hay eventos de dominio; falta verificar la sección reciente del panel |
| TC-08 | RF-10: navegación del menú | E2E | Media | 6 | Pendiente |
| TC-09 | RF-11: cerrar sesión y proteger rutas | API/E2E | Alta | 2 | Pendiente |
| TC-10 | RF-12: crear auditoría con datos completos | API/E2E | Alta | 3 | Parcial: se prueba propuesta/aprobación, no el flujo completo de captura de auditoría |
| TC-11 | RF-12: creación con campos vacíos | Unit/API | Alta | 3 | Parcial: validación de propuestas existe; validar contrato de auditoría |
| TC-12 | RF-12: creación con datos inválidos | Unit/API | Alta | 3 | Parcial: validación de propuestas existe; validar contrato de auditoría |
| TC-13 | RF-13: edición de auditoría | API/E2E | Alta | 3 | Parcial: se edita propuesta abierta; falta edición del expediente según estado |
| TC-14 | RF-13: edición con campos vacíos | Unit/API | Alta | 3 | Parcial |
| TC-15 | RF-14: transición de estado reflejada en panel | API/UI | Alta | 3 | Parcial: transición de propuesta aprobada a activa/cerrada probada por API |
| TC-16 | RF-16: riesgo válido reflejado en panel | API/UI | Alta | 3 | Parcial: registro/cálculo de riesgo probado; falta verificar tablero integrado |
| TC-17 | RF-16: riesgo inválido | Unit/API | Alta | 3 | Existente parcialmente: límites de escala y campos de riesgo |
| TC-18 | RF-19: carga exitosa de archivo | API/E2E | Media | 4 | Bloqueado: solo hay referencias/metadatos, no carga binaria |
| TC-19 | RF-19: archivo excede límite | API/E2E | Media | 4 | Bloqueado: falta carga binaria y límite configurado |
| TC-20 | RF-24: notificación al responsable | API/E2E | Media | 4 | Parcial: bandeja derivada probada; falta entrega/notificación del evento de negocio descrito |
| TC-21 | RF-24: marcar/gestionar como leída | API/E2E | Media | 4 | Bloqueado: la bandeja no persiste estados de lectura |
| TC-22 | RF-27: aplicar filtros | API/E2E | Media | 5 | Parcial: existen filtros de riesgos/evidencias, no de reportes |
| TC-23 | RF-27: búsqueda con coincidencias | API/E2E | Media | 5 | Parcial: búsqueda de riesgos/evidencias; falta búsqueda global/reportes |
| TC-24 | RF-27: búsqueda sin resultados | API/UI | Media | 5 | Pendiente |
| TC-25 | RF-27: filtro sin resultados | API/UI | Media | 5 | Pendiente |
| TC-26 | RF-29: exportación completa | API/E2E | Media | 5 | Bloqueado: no se encontró función de reportes/exportación en la línea base |
| TC-27 | RF-29: exportar datos filtrados | API/E2E | Media | 5 | Bloqueado: falta función de exportación |
| TC-28 | RF-29: exportar filtro vacío | API/UI | Media | 5 | Bloqueado: falta función de exportación |
| TC-29 | RF-30/RNF-03: funciones distintas por rol | Unit/API/E2E | Alta | 2 | Parcial: listado/edición y denegación por rol cubiertos en API; falta matriz completa de módulos |
| TC-30 | RF-33: cerrar auditoría y evitar edición posterior | API/UI | Alta | 3 | Parcial: transición de auditoría activa a cerrada probada por API |
| TC-31 | RNF-01: 150 usuarios concurrentes | Carga | Alta | 7 | Pendiente: no existe prueba de carga |
| TC-32 | RNF-01: 250 o más usuarios y umbral de respuesta | Carga | Alta | 7 | Pendiente: no existe prueba de carga ni ambiente representativo |
| TC-33 | RNF-06: navegadores compatibles | E2E | Media | 6 | Pendiente |
| TC-34 | RNF-06: navegador no compatible | E2E/manual | Media | 6 | Pendiente; acordar comportamiento soportado y mensaje esperado |
| TC-35 | RNF-07: escritorio, tablet, orientación | UI/manual | Media | 6 | Pendiente |
| TC-36 | RNF-17: contraseña segura aceptada | Unit/API | Alta | 2 | Cubierto por unitarias de reglas y API de registro |
| TC-37 | RNF-07: diseño responsivo en dispositivos | UI/manual | Media | 6 | Pendiente |
| TC-38 | RNF-17: política mínima de longitud, mayúsculas, minúsculas y números | Unit/API | Alta | 2 | Cubierto por unitarias: frontera de ocho caracteres y cada categoría requerida |
| TC-39 | RF-02: administrador edita rol y deshabilita usuario | API/E2E | Alta | 2 | Cubierto por API: cambio de rol/estado, actor sin permiso y sesión anterior invalidada/reactivada |
| TC-40 | RF-05: panel con gráficas, métricas y acciones | API/E2E | Media | 5 | Parcial: datos y permisos del dashboard tienen prueba API; falta render/UI |
| TC-41 | RF-06: total por trimestre seleccionado | Unit/API/E2E | Media | 5 | Parcial: datos de portafolio se prueban; selector y conteo de trimestre requieren cobertura explícita |
| TC-42 | RF-07: auditorías activas pendientes | API/UI | Alta | 3 | Parcial: endpoint de auditorías activas probado; falta UI y casos de filtrado/orden |
| TC-43 | RF-08: matriz de riesgo del panel | Unit/API/UI | Alta | 5 | Parcial: se valida estructura de matriz en API; falta casos con distribución de riesgos y render |
| TC-44 | RF-16: riesgo válido ligado a auditoría | API | Alta | 3 | Parcial: registro de riesgos existe; vínculo descrito requiere confirmar modelo/caso |
| TC-45 | RF-17: impacto, probabilidad y severidad calculada | Unit/API | Alta | 3 | Existente parcialmente: cálculo y reevaluación tienen cobertura API |
| TC-46 | RF-18: control asociado al riesgo | API | Alta | 3 | Existente: enlace de controles a riesgos y validación de IDs |
| TC-47 | RF-20: registrar hallazgo ligado a auditoría | API/E2E | Alta | 3 | Bloqueado: no se encontró módulo/modelo de hallazgos |
| TC-48 | RF-21: crear plan de acción para hallazgo | API/E2E | Alta | 3 | Bloqueado: depende de hallazgos/planes de acción no implementados |
| TC-49 | RF-22: asignar responsable y fecha de compromiso | API/E2E | Alta | 3 | Bloqueado: depende de planes de acción no implementados |
| TC-50 | RF-23: cerrar hallazgo tras completar plan | API/E2E | Alta | 3 | Bloqueado: depende de hallazgos/planes de acción no implementados |
| TC-51 | RF-25: historial de cambios de auditoría | API/UI | Media | 4 | Parcial: historial de propuestas y eventos probados; falta alcance de expediente de auditoría |
| TC-52 | RF-26: comentario dentro de auditoría | API/E2E | Media | 4 | Parcial: comentarios de propuesta probados; falta confirmar comentario de auditoría |
| TC-53 | RF-28: reporte combinado de auditorías/riesgos/hallazgos | API/E2E | Media | 5 | Bloqueado: no se encontró función de reportes ni hallazgos |
| TC-54 | RF-31: crear propuesta con objetivo, alcance, justificación y periodo | API/E2E | Alta | 3 | Parcial: creación/validaciones de propuesta probadas; cotejar cada campo requerido |
| TC-55 | RF-32: aprobar propuesta | API/E2E | Alta | 3 | Existente: aprobación, permisos y transición probados por API |
| TC-56 | RF-32: rechazar propuesta con motivo | API/E2E | Alta | 3 | Existente: motivo obligatorio, actor/fecha y estado terminal probados por API |
| TC-57 | RNF-02: TLS 1.2 o superior en tránsito | Operativa | Alta | 7 | Bloqueado: requiere URL/ambiente desplegado y configuración TLS verificable |
| TC-58 | RNF-03: acceso directo a módulo sin permiso | API/E2E | Alta | 2 | Parcial: endpoints con roles cubiertos; falta matriz completa de rutas y pruebas UI/direct URL |
| TC-59 | RNF-04: registrar login y cambio con usuario/fecha/hora | API/operativa | Alta | 4 | Parcial: eventos se emiten en operaciones cubiertas; falta prueba contractual de login/cambio y persistencia |
| TC-60 | RNF-05: crear auditoría en menos de 10 minutos sin capacitación | Usabilidad/manual | Media | 6 | Pendiente: requiere protocolo y participantes de prueba |
| TC-61 | RNF-08: disponibilidad mensual de 99.5% | Operativa/monitoreo | Media | 7 | Bloqueado: requiere monitoreo continuo durante un mes |
| TC-62 | RNF-09: recuperar servicio desde respaldo en máximo 4 horas | Operativa/manual | Alta | 7 | Bloqueado: requiere respaldo, runbook y simulacro aislado |
| TC-63 | RNF-10: incremento de 300% de usuarios registrados | Carga/escala | Media | 7 | Bloqueado: persistencia/ambiente de carga representativo no disponible |
| TC-64 | RNF-11: agregar instancia sin interrupción | Operativa/carga | Alta | 7 | Bloqueado: requiere despliegue con escalamiento horizontal |
| TC-65 | RNF-12: revisión de privacidad y tratamiento de datos | Revisión/manual | Alta | 7 | Pendiente: definir jurisdicción, inventario de datos y responsable de aprobación |
| TC-66 | RNF-13: conservar historial/evidencia según retención | Operativa/API | Alta | 4 | Bloqueado: almacenamiento actual en memoria, sin política de retención |
| TC-67 | RNF-14: panel carga en máximo 2 segundos | Rendimiento/E2E | Media | 7 | Pendiente: no hay medición base; definir navegador, red y estadístico |
| TC-68 | RNF-15: reporte de hasta 100 páginas en máximo 10 segundos | Rendimiento | Media | 7 | Bloqueado: reportes no implementados |
| TC-69 | RNF-16: activar y usar 2FA | API/E2E | Alta | 2 | Cubierto por API: enrolamiento TOTP, código erróneo/expirado y sesión solo tras código válido |
| TC-70 | RNF-18: WCAG 2.1 AA | A11y/UI/manual | Media | 6 | Pendiente: combinar axe/Lighthouse con teclado y revisión manual |
| TC-71 | RNF-19: interfaz completamente en español | UI/manual | Media | 6 | Pendiente: inventario y verificación de textos visibles |
| TC-72 | RNF-20: mensajes claros sin trazas técnicas | API/E2E | Media | 6 | Parcial: APIs validan errores; falta revisar mensajes visibles y ausencia de detalles internos |
| TC-73 | RNF-21: aviso de mantenimiento con 48 horas | Operativa/E2E | Media | 7 | Bloqueado: no se encontró agenda/canal de mantenimiento |
| TC-74 | RNF-22: respaldo diario automático | Operativa | Alta | 7 | Bloqueado: requiere servicio de respaldo y evidencia de ejecución diaria |
| TC-75 | RNF-23: rendimiento con alto volumen de evidencias | Carga | Media | 7 | Bloqueado: no se almacenan archivos binarios |
| TC-76 | RNF-24: integrar una fuente externa nueva | Integración | Media | 7 | Pendiente: definir fuente, contrato y prueba de integración |
| TC-77 | RNF-25: aviso de privacidad y consentimiento explícito | E2E/revisión | Alta | 7 | Pendiente: definir texto legal, captura y almacenamiento del consentimiento |
| TC-78 | RNF-26: alineación con estándares IIA | Revisión/manual | Media | 7 | Pendiente: acordar estándar/versión, alcance y revisor competente |

## Datos de prueba y privacidad

Usar cuentas, correos, nombres, riesgos, comentarios y referencias sintéticos reservados para pruebas. No reutilizar los correos de ejemplo del documento como cuentas reales ni adjuntar datos de personas/clientes. Cada corrida debe crear datos identificables por prefijo único y limpiar o reiniciar su almacenamiento aislado al terminar. Nunca registrar contraseñas, códigos TOTP, tokens JWT ni secretos en logs o artefactos.

## Evidencia por corrida

Para cada workflow/corrida registrar: commit y rama probados; nombre/versión del entorno; fecha y zona horaria; inicio, fin y duración; herramienta/versión; casos ejecutados, aprobados, fallidos y bloqueados; navegador/viewport o perfil de carga; defectos vinculados; y enlaces a logs/artifacts. Los tiempos describen una ejecución concreta y no son un SLO por sí mismos.
