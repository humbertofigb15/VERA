# Calidad de software local

Desde la raíz del repositorio, ejecuta:

```sh
npm run quality
```

El comando corre las verificaciones del backend y del frontend en secuencia y falla en cuanto una no pasa.

## Verificaciones incluidas

- **Sintaxis:** analiza todos los archivos JavaScript del backend, incluidas las pruebas.
- **Pruebas unitarias:** valida reglas de correo, nombre, contraseña y estados de cuenta.
- **Prueba de integración:** levanta la aplicación Express en un puerto temporal y comprueba su endpoint de salud.
- **Cobertura:** informa cobertura de las pruebas del backend con el runner integrado de Node.js.
- **Análisis estático:** ESLint revisa el frontend; la comprobación de sintaxis cubre el backend.
- **Build:** genera el bundle de producción del frontend con Vite.
- **Dependencias:** audita dependencias de producción y desarrollo con `npm audit` y detiene el flujo ante vulnerabilidades altas o críticas.

También puedes ejecutar cada etapa por separado, por ejemplo `npm test`, `npm run test:coverage`, `npm run lint`, `npm run build` o `npm run audit` desde la raíz.

Esta rutina se ejecuta manualmente en la terminal. No configura GitHub Actions ni otros servicios de CI.
