# Implementation Plan: Segregación Frontend y Backend para Arquitectura Profesional

**Branch**: `feature/003-frontend-backend-segregation` | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-frontend-backend-segregation/spec.md`

---

## 1. Summary

Transformación de la aplicación en una arquitectura profesional full-stack segregada mediante *npm workspaces*, dividiendo el proyecto en tres paquetes complementarios:
1. `packages/shared`: DTOs, modelos de dominio, validaciones Zod y tipos TypeScript comunes.
2. `packages/backend`: Servidor RESTful Node.js + TypeScript con Fastify (o Express), base de datos relacional SQLite (via `better-sqlite3`), logging estructurado Pino y pasarela de imágenes segura con caché server-side.
3. `packages/frontend`: Aplicación cliente React 19 + TypeScript + Vite que consume el backend mediante un `ApiClient` tipado, proxy de desarrollo y sincronización optimista, eliminando datos estáticos en memoria.

---

## 2. Technical Context

**Language/Version**: TypeScript 5.8 / Node.js 20+ LTS  
**Workspaces Architecture**: npm Workspaces (`packages/shared`, `packages/backend`, `packages/frontend`)  
**Backend Framework**: Fastify 5.x (o Express 5) con TypeScript nativo  
**Database/Persistence**: SQLite 3 embebido (`better-sqlite3`) con modo WAL y foreign keys activadas  
**Frontend Framework**: React 19, React-DOM 19, Vite 6, Lucide React, Vanilla CSS Tokens  
**Validation & Contracts**: Zod para validación de esquemas en runtime en peticiones HTTP  
**Testing**: Vitest, React Testing Library, Supertest (para pruebas de contrato e integración backend)  
**Security & Observability**: Helmet, CORS, Pino (JSON logging estructurado), Rate Limiting  
**Developer Experience**: `npm run dev` unificado (concurrente), Vite proxy a `http://localhost:4000/api`  
**Constitutional Constraints**: Zero emojis en UI y código, 100% strict typing sin `any`, TDD mandatorio.

---

## 3. Constitution Check

*GATE: Must pass before implementation.*

- **Principio I (Spec-First & Library-First Architecture)**: **APROBADO**. Se formalizan especificación funcional ([spec.md](spec.md)), modelo de datos ([data-model.md](data-model.md)), decisiones de arquitectura ([research.md](research.md)) y contratos de interfaz ([contracts/api.contract.md](contracts/api.contract.md)) previo a cualquier refactorización. El paquete `shared` actúa como librería fundamental.
- **Principio II (Test-First Quality Assurance - TDD Mandatorio)**: **APROBADO**. Se diseñan pruebas de contrato HTTP con Supertest antes de implementar los controladores del backend, y pruebas de integración para el `ApiClient` frontend.
- **Principio III (CLI-First & Text Protocol Interfaces)**: **APROBADO**. La API backend expone una interfaz REST estándar con payloads JSON estructurados que pueden ser consultados o automatizados mediante `curl` o scripts de terminal.
- **Principio IV (Continuous Integration & Observability)**: **APROBADO**. Endpoint de salud `/api/v1/health`, logging estructurado Pino en el backend, y comandos unificados en la raíz (`npm run typecheck`, `npm test`, `npm run build`).
- **Principio V (Simplicity & YAGNI Principle)**: **APROBADO**. Uso de npm workspaces nativo (sin herramientas complejas de monorepo de terceros) y SQLite embebido (sin requerir contenedores Docker obligatorios para ejecutar la app localmente).

---

## 4. Project Structure

```text
githubSpecKit/
├── package.json                         # Root workspace config: "workspaces": ["packages/*"]
├── packages/
│   ├── shared/                          # Contratos y tipos compartidos
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── models/                  # Recipe, ImageCandidate, Preference, Plan
│   │       └── dto/                     # RecipeDto, ImageDto, PlannerDto, ErrorDto
│   ├── backend/                         # Servidor REST API
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── server.ts                # Inicialización del servidor HTTP
│   │       ├── app.ts                   # Configuración de plugins, rutas y middlewares
│   │       ├── domain/                  # Lógica de negocio y entidades
│   │       ├── infrastructure/
│   │       │   ├── database/            # Conexión SQLite, migraciones y seeders
│   │       │   ├── repositories/        # SQLiteRecipeRepository, SQLitePreferenceRepository, etc.
│   │       │   └── external/            # UnsplashImageProvider con caché y rate limit
│   │       └── presentation/
│   │           └── routes/              # /api/v1/recipes, /api/v1/images, /api/v1/preferences, /planner
│   └── frontend/                        # SPA React 19 + Vite
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts               # Proxy /api -> http://localhost:4000
│       └── src/
│           ├── infrastructure/
│           │   └── api/                 # ApiClient HTTP tipado consumiendo /api/v1
│           ├── presentation/            # Componentes, vistas y estilos existentes
│           └── ...
└── specs/
    └── 003-frontend-backend-segregation/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── quickstart.md
        └── contracts/
            └── api.contract.md
```

---

## 5. Implementation Phases

### Phase 1: Workspace Infrastructure & Shared Contracts
- Configurar `package.json` raíz con `"workspaces": ["packages/*"]`.
- Crear `packages/shared` con modelos y DTOs extraídos y normalizados.
- Configurar scripts unificados en la raíz (`dev`, `build`, `test`, `typecheck`).

### Phase 2: Backend Architecture & Persistence (TDD)
- Configurar `packages/backend` con Fastify, TypeScript y Vitest + Supertest.
- Implementar la capa de base de datos SQLite con migraciones automáticas y seed del catálogo.
- Implementar pruebas de contrato para los endpoints de recetas, preferencias, imágenes y planificador.
- Implementar controladores, pasarela segura de imágenes Unsplash y middleware de seguridad.

### Phase 3: Frontend Refactoring & API Client Integration
- Mover el código actual de `src/` a `packages/frontend/src/`.
- Configurar proxy de desarrollo en `vite.config.ts`.
- Implementar `ApiClient` tipado en `packages/frontend/src/infrastructure/api/api_client.ts`.
- Adaptar `RecipeService`, `RecipeImagePreferenceService` y `PlannerService` para consultar la API REST conservando la reactividad en la UI.

### Phase 4: Verification, Convergence & Documentation
- Ejecutar suite de pruebas completa en todos los workspaces.
- Documentar puesta en marcha en `quickstart.md`.
- Asegurar que `npm run typecheck`, `npm test` y `npm run build` pasan limpiamente con 0 errores.
