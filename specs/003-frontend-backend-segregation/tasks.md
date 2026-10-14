# Implementation Tasks: Segregación Frontend y Backend

**Feature**: `003-frontend-backend-segregation`  
**Specification**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Task Organization

Las tareas se ordenan cronológicamente por fases y dependencias. Las tareas marcadas con `[P]` pueden ejecutarse en paralelo una vez completados sus prerrequisitos.

---

## Phase 1: Shared Models, DTOs & Tooling Setup

- [ ] T001 Crear directorio `shared/` con subdirectorios `models/`, `dto/` y punto de exportación `shared/index.ts`.
- [ ] T002 [P] Extraer y definir modelos de dominio limpios en `shared/models/` (`allergen.ts`, `cooking_time.ts`, `ingredient.ts`, `recipe.ts`, `recipe_image_candidate.ts`, `recipe_image_preference.ts`, `weekly_plan.ts`, `shopping_list.ts`).
- [ ] T003 [P] Definir DTOs y esquemas de validación Zod en `shared/dto/` (`recipe.dto.ts`, `image.dto.ts`, `planner.dto.ts`, `error.dto.ts`).
- [ ] T004 Configurar path aliases en `tsconfig.json` (`@shared/*`, `@frontend/*`, `@backend/*`).

---

## Phase 2: Backend Architecture & Persistence (TDD)

- [ ] T005 Instalar dependencias del backend (`fastify`, `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit`, `better-sqlite3`, `@types/better-sqlite3`).
- [ ] T006 Implementar conexión SQLite, pragmas WAL y migraciones DDL automáticas en `backend/database/sqlite.ts`.
- [ ] T007 Implementar seeder del catálogo inicial de recetas en `backend/database/seeds/recipes.seed.ts`.
- [ ] T008 [P] Crear pruebas de contrato con Supertest/Fastify inject para `GET /api/v1/health` y `GET /api/v1/recipes` en `tests/backend/recipes.contract.test.ts`.
- [ ] T009 [P] Crear pruebas de contrato para `GET /api/v1/images/candidates` en `tests/backend/images.contract.test.ts`.
- [ ] T010 [P] Crear pruebas de contrato para `GET/PUT/DELETE /api/v1/preferences` en `tests/backend/preferences.contract.test.ts`.
- [ ] T011 [P] Crear pruebas de contrato para `GET/PUT /api/v1/planner` y `GET /api/v1/shopping-list` en `tests/backend/planner.contract.test.ts`.
- [ ] T012 Implementar repositorios SQLite (`SQLiteRecipeRepository`, `SQLitePreferenceRepository`, `SQLitePlannerRepository`) en `backend/repositories/`.
- [ ] T013 Implementar pasarela segura de imágenes Unsplash con caché en memoria y fallback SVG en `backend/services/image_provider_gateway.ts`.
- [ ] T014 Configurar servidor Fastify con plugins de seguridad (Helmet, CORS, Rate Limit) y logging Pino en `backend/app.ts` y `backend/server.ts`.
- [ ] T015 Implementar y registrar controladores REST en `backend/controllers/` (`recipe_controller.ts`, `image_controller.ts`, `preference_controller.ts`, `planner_controller.ts`, `health_controller.ts`).

---

## Phase 3: Frontend Refactoring & API Client Integration

- [ ] T016 Mover componentes, hooks, estilos y entrypoints de `src/presentation/` y `src/` a `frontend/`.
- [ ] T017 Configurar proxy de desarrollo en `vite.config.ts` (`/api` -> `http://localhost:4000`) y actualizar `index.html` para apuntar a `/frontend/main.tsx`.
- [ ] T018 Implementar cliente HTTP tipado `ApiClient` en `frontend/api/api_client.ts`.
- [ ] T019 Adaptar servicios en `frontend/services/` (`RecipeService`, `RecipeImagePreferenceService`, `PlannerService`) para consumir el backend con sincronización optimista.

---

## Phase 4: Migration Cleanup & Test Consolidation

- [ ] T020 Reubicar pruebas de componentes existentes de `src/tests/` a `tests/frontend/` actualizando imports hacia `@frontend/*` y `@shared/*`.
- [ ] T021 Eliminar de forma segura el directorio legado `src/`.
- [ ] T022 Actualizar scripts en `package.json` para ejecución concurrente (`npm run dev`), build unificado (`npm run build`), y test (`npm test`).

---

## Phase 5: Verification, Convergence & Documentation

- [ ] T023 Ejecutar suite de pruebas completa en `tests/` (`npm test`).
- [ ] T024 Ejecutar verificación estricta de tipos (`npm run typecheck`).
- [ ] T025 Ejecutar build de producción unificado (`npm run build`).
- [ ] T026 Validar flujo de usuario de extremo a extremo sin regresiones en la interfaz ni en la persistencia.
