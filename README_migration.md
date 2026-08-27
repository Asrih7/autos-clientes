# Guía de migración

## Nx 16 + Angular 16 + Jest → Nx 22 + Angular 21 + Vitest

---

## 0. Introducción

### 0.1 Objetivo

Esta guía describe un proceso **controlado, reproducible y limpio** para migrar un monorepo basado en **Nx 16 + Angular 16 + Jest** hacia **Nx 22 + Angular 21 + Vitest**, evitando inconsistencias históricas y deuda técnica.

### 0.2 Estrategia adoptada

La migración **NO se realiza in-place**. Se crea un **workspace nuevo desde cero** con Nx 22 y se **porta únicamente el código fuente necesario**.

**Motivación:**

- Evitar configuraciones obsoletas
- Aprovechar defaults modernos de Nx 22
- Adoptar Angular standalone-first
- Sustituir Jest por Vitest de forma segura

### 0.3 Tecnologías

| Área         | Origen     | Destino             |
| ------------ | ---------- | ------------------- |
| Monorepo     | Nx 16      | Nx 22               |
| Framework    | Angular 16 | Angular 21          |
| Unit testing | Jest       | Vitest (+ AnalogJS) |

---

## 1. Prerrequisitos y preparación

### 1.1 Requisitos

- Node.js compatible con Nx 22 (24.13.1)
- npm / pnpm
- Git

### 1.2 Auditoría previa del proyecto original

> ⚠️ **Aviso previo**
>
> Antes de iniciar esta migración, el proyecto original debe encontrarse en un estado **estable y libre de errores**.
>
> Es imprescindible que, en el workspace de origen (Nx 16 + Angular 16):
>
> - las dependencias del porjecto se estan instalando sin usar el flag --legacy-peer-deps
> - El **build** de aplicaciones y librerías se ejecute sin errores.
> - Los **tests unitarios** pasen correctamente.
> - El **lint** no presente errores críticos (recomendado).
>
> Esta guía no está orientada a corregir problemas preexistentes. Migrar un proyecto con errores provocará que estos se arrastren y se amplifiquen en el nuevo workspace (Nx 22 + Angular 21), dificultando el diagnóstico y la migración.

Antes de migrar:

- Listar aplicaciones
- Listar librerías
- Clasificar librerías (ui, feature, data-access, util)
- Detectar dependencias críticas
- Identificar uso de NgModules

### 1.3 Qué NO se migra

> **Se migra código, no configuración**

NO copiar desde el proyecto original:

- `angular.json`, `workspace.json`, `nx.json`
- `project.json` antiguos
- Configuración Jest (`jest.config.*`, `setup-jest.ts`)
- `tsconfig*` legacy
- Scripts custom de npm

Estos elementos se **regeneran** en el nuevo workspace con Nx 22.

---

## 2. Obtención del workspace base (Nx 22)

1. Descargar el repositorio base:

   > _[descargar .zip](https://gitlab.caser.local/arquitectura-interno/global-front-components/ng-archit-app-ng21/-/archive/master/ng-archit-app-ng21-master.zip?ref_type=heads)_

2. Entrar en el workspace:

```bash
cd nuevo-workspace
npm install
```

---

## 3. Generación de proyectos

Una vez identificadas las aplicaciones y librerias que contien nuestro actual proyectro, pasamos a crearlas en el nuevo proyecto usando los sigueinte comandos.
recomendamoshacer uso del flag _ --dry-run _ poara testear que se realiza de manera correcta

### 3.1 Principios

- Standalone por defecto
- Vitest como runner
- Nx-first (targets, no scripts custom)
- Uso de `--no-interactive` y `--dry-run`

### 3.2 Aplicaciones Angular

#### Aplicación standalone (recomendada)

```bash
npx nx generate @nx/angular:application
  --name=my-app
  --prefix=app
  --style=scss
  --standalone=true
  --unitTestRunner=vitest-analog
  --e2eTestRunner=cypress
  --linter=eslint
  --bundler=esbuild
  --directory=apps/my-app
  --no-interactive
```

#### Aplicación con NgModules (solo legacy)

```bash
--standalone=false
```

#### Craer projecto de apicacion sin e2e

```bash
--e2eTestRunner=none
```

### 3.3 Librerías

#### Librería standalone

```bash
npx nx generate @nx/angular:library
  --name=mi-lib
  --standalone=true
  --style=scss
  --unitTestRunner=vitest-analog
  --directory=libs/mi-lib
  --buildable=true
  --importPath=@libs/mi-lib
  --no-interactive
```

#### Librería publishable

```bash
--publishable=true
```

---

## 4. Portado del código fuente

### 4.1 Estrategia

1. Generar el proyecto con Nx 22 ✅
2. Eliminar `src` generado
3. Copiar `src` desde el proyecto original

```bash
rm -rf apps/mi-app/src
cp -r proyecto-antiguo/apps/mi-app/src apps/mi-app/src
```

### 4.2 Otras carpetas a revisar

Asegurese de portar cualquier otra carpeta que sea necesearia para el correcto funcionamiento de su proyecto. estas son algunas de las mas habituales:

- `assets/`
- `environments/`
- `mocks/`
- `public/`
- `proxy.conf.*`

### 4.2 Revision de la configuracion project.json

revise los archivos de configuracion de los projectos (project.json) y porte cualquier configuracion necesaria. como puede ser el copiado y los archivos de assets y style. configuraciones de los diferntes entornos, etc...

---

## 5. Migración de tests: Jest → Vitest

## 5.1 Configuración de testing con Vitest (Angular 21)

### 5.1.1 Dependencias necesarias

Confirmar que las siguientes dependecias están instaladas

```bash
npm ls vitest
npm ls @nx/vitest
npm ls @vitest/coverage-v8
npm ls jsdom
npm ls @analogjs/vite-plugin-angular
```

### 5.1.2 vitest.config.ts (por proyecto)

reemplazar los archivos de configuracion de los test anteriores por el nuevo _vitest.config.ts_ con el siguinete contenido

```ts
/// <reference types='vitest' />
import { defineConfig } from 'vitest/config';
import analog from '@analogjs/vite-plugin-angular';
import path from 'path';

export default defineConfig({
	cacheDir: path.resolve(__dirname, '../../node_modules/.vite/'),
	plugins: [analog()],
	resolve: {
		alias: {
			// alias de las librerías internas
			'@libs/services': path.resolve(__dirname, '../../libs/services/src/index.ts')
		}
	},
	test: {
		globals: true,
		environment: 'jsdom',
		reporters: ['default'],
		include: ['src/**/*.spec.ts'],
		setupFiles: ['src/test-setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			reportsDirectory: '../../coverage/my-app'
		}
	}
});
```

### 5.1.3 test-setup.ts

```ts
import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
```

### 5.1.4 project.json

Asegurese de tener el target test bien definido

```json
 "test": {
      "run": true,
      "executor": "@nx/vitest:test",
      "outputs": ["{workspaceRoot}/coverage/apps/my-app"],
      "options": {
        "config": "apps/my-app/vitest.config.ts",
        "tsconfig": "apps/my-app/tsconfig.spec.json",
        "passWithNoTests": true
      },
      "configurations": {
        "coverage": {
          "coverage": true
        },
        "ui": {
          "ui": true,
          "watch": true
        }
      }
    }
```

---

### 5.2 Cambios principales

Una vez migrada la configuración de Jest a Vitest, es necesario revisar y adaptar los tests existentes.

Aunque la mayoría de las APIs son compatibles, Vitest no es un reemplazo completamente transparente. En general, los cambios son menores, pero deben aplicarse de forma sistemática para evitar errores sutiles o comportamientos inesperados.

| Jest                 | Vitest             |
| -------------------- | ------------------ |
| fakeAsync            | async - await      |
| jest.fn()            | vi.fn()            |
| jest.fn()            | vi.fn()            |
| jest.spyOn()         | vi.spyOn()         |
| jest.mock()          | vi.mock()          |
| jest.useFakeTimers() | vi.useFakeTimers() |

### 5.3 Eliminar o reemplazar `fakeAsync`

- `fakeAsync` no funciona igual que en Jest y puede generar errores o comportamientos inesperados.
- Siempre que sea posible, sustituirlo por `async/await`.
- Evitar el uso combinado de `fakeAsync`, `tick()` y `flush()`.

Ejemplo de migración:

```ts
it('should load data', fakeAsync(() => {
	let result;
	service.loadData().then((r) => (result = r));
	tick();
	expect(result).toBeTruthy();
}));
```

```ts
it('should load data', async () => {
	const result = await service.loadData();
	expect(result).toBeTruthy();
});
```

### 5.4 lanzar los test

```bash
npx nx test mi-app
```

---

## 7. Instalación y resolución de conflictos

```bash
npm install
```

Resolver:

- Conflictos de versiones
- Errores de tipos

---

## 8. Validación

### 8.1 Build

```bash
npx nx build <project>
```

### 8.2 Serve

```bash
npx nx serve <app>
```

---

## 9. Limpieza final

- Eliminar Jest y dependencias asociadas
- Eliminar configs obsoletas
- Verificar project graph

---

## 10. Criterios de éxito

- Build limpio
- Tests pasando en Vitest
- Coverage mínimo alcanzado

---
