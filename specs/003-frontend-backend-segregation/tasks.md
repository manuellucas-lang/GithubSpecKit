# Implementation Tasks: Segregación Frontend y Backend

**Feature**: `003-frontend-backend-segregation`  
**Specification**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Task Organization

Las tareas se ordenan cronológicamente por fases y dependencias. Las tareas marcadas con `[P]` pueden ejecutarse en paralelo una vez completados sus prerrequisitos.

---

## Phase 1: Monorepo Workspaces & Shared Contracts Setup

- [ ] T001 Configurar `package.json` raíz con configuración de npm workspaces (`workspaces: ["packages/*"]`) y scripts unificados (`dev`, `build`, `test`, `typecheck`).
- [ ] T002 [P] Crear el paquete `packages/shared/package.json` y `packages/shared/tsconfig.json`.
- [ ] T003 [P] Extraer y definir modelos de dominio en `packages/shared/src/models/` (`recipe.ts`, `recipe_image_candidate.ts`, `recipe_image_preference.ts`, `weekly_plan.ts`).
- [ ] T004 [P] Definir DTOs y esquemas de validación Zod en `packages/shared/src/dto/` (`recipe.dto.ts`, `image.dto.ts`, `planner.dto.ts`, `error.dto.ts`).
- [ ] T005 [P] Crear exportación pública centralizada en `packages/shared/src/index.ts` y compilar el paquete compartido.

---

## Phase 2: Backend Architecture & Persistence (TDD)

- [ ] T006 Inicializar `packages/backend/package.json`, `packages/backend/tsconfig.json` y `packages/backend/vitest.config.ts`.
- [ ] T007 Implementar conexión SQLite y ejecución de migraciones DDL con modo WAL en `packages/backend/src/infrastructure/database/sqlite.ts`.
- [ ] T008 Implementar seeder del catálogo inicial de recetas en `packages/backend/src/infrastructure/database/seeds/recipes.seed.ts`.
- [ ] T009 [P] Crear pruebas de contrato con Supertest para `GET /api/v1/health` y `GET /api/v1/recipes` en `packages/backend/src/tests/contract/recipes.contract.test.ts`.
- [ ] T010 [P] Crear pruebas de contrato con Supertest para `GET /api/v1/images/candidates` en `packages/backend/src/tests/contract/images.contract.test.ts`.
- [ ] T011 [P] Crear pruebas de contrato con Supertest para `GET/PUT/DELETE /api/v1/preferences` en `packages/backend/src/tests/contract/preferences.contract.test.ts`.
- [ ] T012 [P] Crear pruebas de contrato con Supertest para `GET/PUT /api/v1/planner` y `GET /api/v1/shopping-list` en `packages/backend/src/tests/contract/planner.contract.test.ts`.
- [ ] T013 Implementar `SQLiteRecipeRepository` en `packages/backend/src/infrastructure/repositories/sqlite_recipe_repository.ts`.
- [ ] T014 Implementar `SQLitePreferenceRepository` en `packages/backend/src/infrastructure/repositories/sqlite_preference_repository.ts`.
- [ ] T015 Implementar `SQLitePlannerRepository` en `packages/backend/src/infrastructure/repositories/sqlite_planner_repository.ts`.
- [ ] T016 Implementar pasarela segura de imágenes Unsplash con caché y fallback en `packages/backend/src/infrastructure/external/unsplash_image_provider.ts`.
- [ ] T017 Configurar servidor Fastify/Express con plugins de seguridad (Helmet, CORS, Rate Limit) y logging Pino en `packages/backend/src/app.ts` y `server.ts`.
- [ ] T018 Implementar y registrar rutas `/api/v1/recipes`, `/api/v1/images`, `/api/v1/preferences`, `/api/v1/planner`, `/api/v1/shopping-list` y `/health`.

---

## Phase 3: Frontend Refactoring & API Client Integration

- [ ] T019 Migrar estructura cliente actual a `packages/frontend/` actualizando `package.json` para depender de `@recipe-app/shared`.
- [ ] T020 Configurar proxy `/api` hacia `http://localhost:4000` en `packages/frontend/vite.config.ts`.
- [ ] T021 Implementar cliente HTTP tipado `ApiClient` en `packages/frontend/src/infrastructure/api/api_client.ts`.
- [ ] T022 Adaptar `RecipeService` en el frontend para consumir `GET /api/v1/recipes` a través de `ApiClient`.
- [ ] T023 Adaptar `RecipeImagePreferenceService` en el frontend para sincronizar contra `PUT/DELETE /api/v1/preferences` con fallback optimista.
- [ ] T024 Adaptar `PlannerService` en el frontend para sincronizar el menú semanal contra `GET/PUT /api/v1/planner`.
- [ ] T025 Actualizar componentes (`RecipeCatalog`, `RecipeDetail`, `RecipeImageCarouselModal`, `WeeklyPlanner`) para manejar estados de carga y error del servidor.

---

## Phase 4: Integration Verification & Validation

- [ ] T026 Ejecutar suite de pruebas completa en todos los paquetes (`npm test`).
- [ ] T027 Ejecutar verificación estricta de tipos en la raíz (`npm run typecheck`).
- [ ] T028 Ejecutar build de producción unificado (`npm run build`).
- [ ] T029 Validar flujo de usuario de extremo a extremo: catálogo -> detalle -> selección de imagen en carrusel -> persistencia en backend -> planificador semanal.
