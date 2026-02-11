# 🚀 Configuración de CI/CD - GitHub Actions

Este documento explica la configuración del pipeline de CI/CD para el proyecto Supermercado.

## 📋 Resumen del CI Workflow

El workflow está dividido en **3 jobs principales**:

### 1️⃣ **Backend** - Tests, Coverage & Lint

Ejecuta todas las verificaciones para el backend Node.js/Express:

- ✅ **ESLint**: Verifica la calidad del código
- ✅ **Tests**: Ejecuta las pruebas unitarias con Jest
- ✅ **Coverage**: Genera reporte de cobertura de código
- 📦 **Artifact**: Sube el reporte de cobertura para revisión

**Scripts ejecutados:**

```bash
npm run lint      # ESLint
npm test          # Jest tests
npm run coverage  # Jest con cobertura
```

### 2️⃣ **Frontend Angular** - Tests & Coverage

Ejecuta todas las verificaciones para el frontend Angular:

- ✅ **Tests**: Ejecuta las pruebas unitarias con Karma/Jasmine
- ✅ **Coverage**: Genera reporte de cobertura de código con Angular CLI
- 📦 **Artifact**: Sube el reporte de cobertura para revisión

**Scripts ejecutados:**

```bash
npm run coverage  # ng test --code-coverage --no-watch
```

**Nota:** El frontend Angular no tiene ESLint configurado en este momento. Si deseas agregarlo, consulta la sección "Agregar ESLint al Frontend" más abajo.

### 3️⃣ **Summary** - Resumen de CI

Verifica el estado de todos los jobs anteriores y muestra un resumen:

- ✅ Si todos los jobs pasan: Pipeline exitoso
- ❌ Si algún job falla: Pipeline falla y muestra cuál

---

## 🔧 Características del CI

### ✨ Optimizaciones implementadas:

1. **Jobs paralelos**: Backend y Frontend se ejecutan simultáneamente para mayor velocidad
2. **Cache de npm**: Usa cache para acelerar la instalación de dependencias
3. **npm ci**: Usa `npm ci` en lugar de `npm install` para instalaciones más rápidas y consistentes
4. **Working directory**: Cada job trabaja en su directorio correspondiente
5. **Artifacts**: Los reportes de cobertura se guardan por 30 días
6. **Conditional upload**: Los reportes se suben incluso si los tests fallan (`if: always()`)

### 📊 Reportes de Cobertura:

Los reportes de cobertura se almacenan como artifacts en GitHub Actions:

- **backend-coverage-report**: Reporte del backend (Jest)
- **frontend-coverage-report**: Reporte del frontend (Karma)

Para descargarlos:

1. Ve a la pestaña "Actions" en GitHub
2. Selecciona el workflow run
3. Baja hasta "Artifacts" y descarga los reportes

---

## 🎯 Triggers (Eventos que activan el CI)

El workflow se ejecuta automáticamente en:

- ✅ **Push a main**: Cada vez que se hace push a la rama main
- ✅ **Pull Request a main**: Cada vez que se crea o actualiza un PR hacia main

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

---

## 📁 Estructura del Proyecto

```
.github/
  workflows/
    ci.yml                           # ← Configuración del CI

supermercado-backend/                # Backend Node.js
  package.json
  package-lock.json
  - npm run lint                     # ← ESLint
  - npm test                         # ← Jest tests
  - npm run coverage                 # ← Jest coverage

supermercado-frontend-angular/       # Frontend Angular
  package.json
  package-lock.json
  - npm run coverage                 # ← ng test --code-coverage
```

---

## 🧪 Ejecutar las pruebas localmente

### Backend:

```bash
cd supermercado-backend

# Instalar dependencias
npm install

# Ejecutar ESLint
npm run lint

# Ejecutar tests
npm test

# Ejecutar tests con cobertura
npm run coverage

# Ver reporte de cobertura
# Abre: coverage/lcov-report/index.html
```

### Frontend Angular:

```bash
cd supermercado-frontend-angular

# Instalar dependencias
npm install

# Ejecutar tests (en modo watch)
npm test

# Ejecutar tests con cobertura
npm run coverage

# Ver reporte de cobertura
# Abre: coverage/supermercado-frontend-angular/index.html
```

---

## 🛠️ Agregar ESLint al Frontend (Opcional)

El frontend Angular actualmente **no tiene ESLint configurado**. Si deseas agregarlo:

### Paso 1: Instalar dependencias

```bash
cd supermercado-frontend-angular
npm install --save-dev @angular-eslint/builder @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template @angular-eslint/schematics @angular-eslint/template-parser @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint
```

### Paso 2: Configurar ESLint para Angular

```bash
ng add @angular-eslint/schematics
```

### Paso 3: Agregar script al package.json

```json
{
  "scripts": {
    "lint": "ng lint"
  }
}
```

### Paso 4: Actualizar el CI

Agrega este paso en el job `frontend` del archivo `.github/workflows/ci.yml`:

```yaml
- name: ESLint - Verificar calidad del código del frontend
  run: npm run lint
```

---

## 🚦 Estado del CI

El estado del CI se puede ver en:

- **Badge en README**: Agrega un badge de estado
- **Pull Requests**: El CI debe pasar antes de hacer merge
- **Actions tab**: Ver historial de ejecuciones

### Agregar badge al README:

```markdown
![CI](https://github.com/USUARIO/REPO/workflows/CI%20Workflow%20-%20Backend%20%26%20Frontend/badge.svg)
```

---

## ✅ Checklist de CI

Antes de hacer push o crear un PR, verifica:

### Backend:

- [ ] `npm run lint` pasa sin errores
- [ ] `npm test` pasa correctamente
- [ ] `npm run coverage` genera reporte

### Frontend:

- [ ] `npm run coverage` pasa correctamente
- [ ] No hay tests fallando

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

- **Solución**: Verifica que `package-lock.json` esté committeado
- **Alternativa**: El CI usará `npm install` si `npm ci` falla

### Error: "Tests failed"

- **Solución**: Ejecuta los tests localmente primero
- **Revisar**: Ver los logs del CI en GitHub Actions

### Error: "ESLint errors"

- **Solución**: Ejecuta `npm run lint` localmente y corrige los errores
- **Auto-fix**: Algunos errores se pueden arreglar con `npm run lint -- --fix`

### Los tests del frontend fallan en CI pero pasan localmente

- **Causa**: Angular tests requieren un navegador (Chrome)
- **Solución**: El CI usa ChromeHeadless automáticamente a través de Karma

---

## 📈 Mejoras Futuras

Posibles mejoras al CI:

- [ ] Agregar ESLint al frontend Angular
- [ ] Integrar con Codecov o Coveralls para tracking de cobertura
- [ ] Agregar job de build para verificar que compile correctamente
- [ ] Agregar Deployment automático después de un CI exitoso
- [ ] Agregar tests E2E con Playwright o Cypress
- [ ] Agregar análisis de seguridad con npm audit
- [ ] Agregar verificación de dependencias actualizadas

---

## 📞 Ayuda

- [Documentación de GitHub Actions](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/)
- [Karma Documentation](https://karma-runner.github.io/)
- [Angular Testing](https://angular.io/guide/testing)
