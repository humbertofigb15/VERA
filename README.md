# VERA

**VERA** es una aplicación web en desarrollo para apoyar flujos de auditoría, planificación y administración de usuarios. Este repositorio incluye una interfaz React y una API Express, junto con verificaciones de calidad ejecutadas localmente y en GitHub Actions.

[![Calidad de software](https://github.com/humbertofigb15/VERA/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/humbertofigb15/VERA/actions/workflows/quality.yml)
[![CodeQL](https://github.com/humbertofigb15/VERA/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/humbertofigb15/VERA/actions/workflows/codeql.yml)

> **Estado:** prototipo académico. Los datos de usuarios y propuestas se mantienen en memoria y se reinician al reiniciar el backend. El repositorio contiene cuentas de demostración; no lo despliegues con datos reales ni lo uses como servicio de producción.

## Funcionalidades actuales

- Registro con aprobación de cuenta y acceso por roles.
- Inicio de sesión con opción de autenticación de dos factores TOTP.
- Administración de usuarios y consulta de actividad de auditoría.
- Creación, edición y aprobación de propuestas de planificación.
- Reglas y pruebas de integración para el ciclo de propuestas de auditoría (HU-22).
- Interfaz web para acceso, usuarios, auditoría, planificación y trimestres.

## Tecnologías

| Componente | Tecnologías |
| --- | --- |
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express, express-rate-limit |
| Autenticación | JWT, bcryptjs, TOTP |
| Calidad | Node test runner, cobertura, ESLint, build de Vite, npm audit |
| Automatización | GitHub Actions, CodeQL y Dependabot |

## Requisitos

- Node.js 22 o superior.
- npm incluido con Node.js.

## Configuración local

Desde la raíz del repositorio, instala las dependencias:

```powershell
npm ci --prefix backend
npm ci --prefix frontend
```

Crea el archivo local de configuración a partir de la plantilla:

```powershell
Copy-Item .env.example .env
```

Genera una clave aleatoria para `JWT_SECRET` y agrégala al archivo `.env`. Debe tener al menos 32 caracteres; no uses una clave compartida ni la subas al repositorio.

```powershell
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

El backend lee `.env` desde la raíz del repositorio y usa el puerto `3000` por defecto. Inícialo en una terminal:

```powershell
npm start --prefix backend
```

En otra terminal, inicia el frontend:

```powershell
npm run dev --prefix frontend
```

Vite muestra la dirección local de la interfaz al iniciar. Las llamadas `/api` se redirigen al backend local mediante la configuración de desarrollo de Vite.

## Comandos de calidad

Desde la raíz del proyecto:

| Comando | Verificación |
| --- | --- |
| `npm run quality` | Ejecuta todas las verificaciones y genera el resumen local en `quality-report/`. |
| `npm run test:coverage` | Pruebas del backend y reporte de cobertura. |
| `npm run lint` | Revisión de sintaxis del backend y ESLint del frontend. |
| `npm run build` | Build de producción del frontend. |
| `npm run audit` | Auditoría de dependencias de backend y frontend. |

El flujo de GitHub Actions ejecuta las verificaciones de calidad en pull requests dirigidos a `main` y en actualizaciones de `main`. El reporte detallado del workflow se conserva como artefacto de Actions durante 14 días.

### HU-22: creación de propuestas de auditoría

El flujo permite crear propuestas con título, objetivo, área, tipo, nivel de riesgo y año; también admite responsable, trimestre y fechas. El backend valida campos obligatorios, catálogos permitidos, año, fechas, auditor responsable activo y duplicados por título, área y año. Las propuestas empiezan abiertas, se pueden editar mientras sigan abiertas y solo roles `SUPER_ADMIN` o `DIRECTOR` pueden aprobarlas. La aprobación requiere un trimestre válido y fija el avance en 100%; una propuesta aprobada queda protegida contra edición y eliminación.

Las pruebas de integración de `backend/tests/planning.integration.test.js` verifican el flujo HTTP de creación, validación, duplicidad, edición, aprobación y permisos. Se ejecutan con `npm run test:coverage --prefix backend` y forman parte de `npm run quality`.

CodeQL analiza JavaScript y TypeScript en los pull requests, en `main` y semanalmente. `npm audit` revisa dependencias de backend y frontend en el flujo de calidad. Dependabot revisa semanalmente dependencias npm y GitHub Actions.

## Estructura

```text
.
├── backend/                 # API, autenticación, rutas, servicios y pruebas
├── frontend/                # Interfaz React y configuración de Vite
├── scripts/                 # Ejecutor del flujo local de calidad
├── .github/workflows/       # Calidad, CodeQL y revisión de dependencias
├── .env.example             # Plantilla local; no contiene secretos
└── quality-report/          # Informes locales y artefactos de calidad (ignorado por Git)
```

## Seguridad y limitaciones

- Configura una clave JWT aleatoria en `.env`; el backend se detiene si falta o tiene menos de 32 caracteres.
- La API limita cada IP a 100 solicitudes por ventana de 15 minutos y responde con `429` al excederla. El almacenamiento predeterminado del límite es en memoria y no se comparte entre varias instancias.
- `.env` está excluido de Git. Comparte únicamente `.env.example`, nunca el archivo local.
- Las cuentas y propuestas se guardan en memoria, sin persistencia duradera.
- Las cuentas y contraseñas de demostración son solo para desarrollo y no deben reutilizarse.
- Antes de cualquier despliegue, se requiere almacenamiento persistente, gestión de secretos de plataforma, configuración de CORS, un almacén compartido para límites de solicitudes, revisión de cuentas de demostración y una evaluación de seguridad del entorno.

## Contribuir

1. Crea una rama de trabajo desde `main`.
2. Mantén cada pull request enfocado en una funcionalidad o cambio de seguridad.
3. Ejecuta `npm run quality` desde la raíz y revisa el resultado antes de abrir el pull request.
4. Espera a que las verificaciones de GitHub Actions y CodeQL terminen.

Los requisitos funcionales en curso se gestionan en las historias de usuario del proyecto; este README describe únicamente el comportamiento existente en el código.
