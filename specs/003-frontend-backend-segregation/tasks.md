# Implementation Tasks: Segregación Frontend y Backend

**Feature**: `003-frontend-backend-segregation`  
**Specification**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Task Organization

Las tareas se ordenan cronológicamente por fases y dependencias. Las tareas marcadas con `[P]` pueden ejecutarse en paralelo una vez completados sus prerrequisitos.

---

## Phase 1: Shared Models, DTOs & Tooling Setup

- [X] T001 Crear directorio `shared/` con subdirectorios `models/`, `dto/` y punto de exportación `shared/index.ts`.
- [X] T002 [P] Extraer y definir modelos de dominio limpios en `shared/models/` (`allergen.ts`, `cooking_time.ts`, `ingredient.ts`, `recipe.ts`, `recipe_image_candidate.ts`, `recipe_image_preference.ts`, `weekly_plan.ts`, `shopping_list.ts`).
- [X] T003 [P] Definir DTOs y esquemas de validación Zod en `shared/dto/` (`recipe.dto.ts`, `image.dto.ts`, `planner.dto.ts`, `error.dto.ts`).
- [X] T004 Configurar path aliases en `tsconfig.json` (`@shared/*`, `@frontend/*`, `@backend/*`).

---

## Phase 2: Backend Architecture & Persistence (TDD)

- [X] T005 Instalar dependencias del backend (`express`, `@types/express`, `cors`, `@types/cors`, `helmet`, `better-sqlite3`, `@types/better-sqlite3`).
- [X] T006 Implementar conexión SQLite, pragmas WAL y migraciones DDL automáticas en `backend/database/sqlite.ts`.
- [X] T007 Implementar seeder del catálogo inicial de recetas en `backend/database/seeds/recipes.seed.ts`.
- [X] T008 [P] Crear pruebas de contrato con Supertest para `GET /api/v1/health` y `GET /api/v1/recipes` en `tests/backend/recipes.contract.test.ts`.
- [X] T009 [P] Crear pruebas de contrato para `GET /api/v1/images/candidates` en `tests/backend/images.contract.test.ts`.
- [X] T010 [P] Crear pruebas de contrato para `GET/PUT/DELETE /api/v1/preferences` en `tests/backend/preferences.contract.test.ts`.
- [X] T011 [P] Crear pruebas de contrato para `GET/PUT/DELETE /api/v1/planner` y `GET /api/v1/shopping-list` con validación y manejo de errores (400, 404) en `tests/backend/planner.contract.test.ts`.
- [X] T012 Implementar repositorios SQLite (`SQLiteRecipeRepository`, `SQLitePreferenceRepository`, `SQLitePlannerRepository`) en `backend/repositories/`.
- [X] T013 Implementar pasarela segura de imágenes Unsplash con caché en memoria y fallback SVG en `backend/services/image_provider_gateway.ts`.
- [X] T014 Configurar servidor Express con middlewares de seguridad (Helmet, CORS) y manejo de errores RFC 7807 en `backend/app.ts` y `backend/server.ts`.
- [X] T015 Implementar y registrar controladores REST en `backend/controllers/` (`recipe_controller.ts`, `image_controller.ts`, `preference_controller.ts`, `planner_controller.ts`, `health_controller.ts`).

---

## Phase 3: Frontend Refactoring & API Client Integration

- [X] T016 Mover componentes, hooks, estilos y entrypoints de `src/presentation/` y `src/` a `frontend/`.
- [X] T017 Configurar proxy de desarrollo en `vite.config.ts` (`/api` -> `http://localhost:4000`) y actualizar `index.html` para apuntar a `/frontend/main.tsx`.
- [X] T018 Implementar cliente HTTP tipado `ApiClient` en `frontend/api/api_client.ts`.
- [X] T019 Adaptar servicios en `frontend/services/` (`RecipeService`, `RecipeImagePreferenceService`, `PlannerService`) para consumir el backend con sincronización optimista.

---

## Phase 4: Migration Cleanup & Test Consolidation

- [X] T020 Reubicar pruebas de componentes existentes de `src/tests/` a `tests/frontend/` actualizando imports hacia `@frontend/*` y `@shared/*`.
- [X] T021 Eliminar de forma segura el directorio legado `src/`.
- [X] T022 Actualizar scripts en `package.json` para ejecución concurrente (`npm run dev`), build unificado (`npm run build`), y test (`npm test`).

---

## Phase 5: Verification, Convergence & Documentation

- [X] T023 Ejecutar suite de pruebas completa en `tests/` (`npm test`).
- [X] T024 Ejecutar verificación estricta de tipos (`npm run typecheck`).
- [X] T025 Ejecutar build de producción unificado (`npm run build`).
- [X] T026 Validar flujo de usuario de extremo a extremo sin regresiones en la interfaz ni en la persistencia.
