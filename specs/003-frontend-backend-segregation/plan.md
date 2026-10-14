# Implementation Plan: Segregación Frontend y Backend para Arquitectura Profesional

**Branch**: `feature/003-frontend-backend-segregation` | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-frontend-backend-segregation/spec.md`

---

## 1. Summary

Transformación de la aplicación culinaria desde una estructura monolítica cliente en `src/` hacia una arquitectura full-stack profesional segregada directamente en tres directorios raíz:
1. `frontend/`: Aplicación cliente React 19 + TypeScript + Vite que consume los endpoints REST mediante un `ApiClient` tipado, proxy de desarrollo y sincronización optimista.
2. `backend/`: Servidor de servicios RESTful Node.js + TypeScript con Fastify, base de datos relacional SQLite (`better-sqlite3` en modo WAL), logging estructurado Pino y pasarela de imágenes segura con caché en memoria y fallback SVG.
3. `shared/`: Modelos de dominio universales, DTOs de comunicación y esquemas de validación Zod compartidos directamente entre cliente y servidor mediante path aliases de TypeScript (`@shared/*`), eliminando la sobrecarga y fricción de paquetes o monorepositorios multinivel.

---

## 2. Technical Context

**Language/Version**: TypeScript 5.8 / Node.js 20+ LTS  
**Directory Architecture**: Segregación directa en raíz (`frontend/`, `backend/`, `shared/`, `tests/`) sin carpeta `packages/`  
**Backend Framework**: Fastify 5.x con TypeScript nativo  
**Database/Persistence**: SQLite 3 embebido (`better-sqlite3`) con modo WAL y claves foráneas activadas en `data/recipes.db`  
**Frontend Framework**: React 19, React-DOM 19, Vite 6, Lucide React, Vanilla CSS Tokens  
**Validation & Contracts**: Zod para validación de esquemas en runtime en peticiones HTTP  
**Testing**: Vitest, React Testing Library, Supertest / Fastify inject para pruebas de contrato  
**Security & Observability**: Helmet, CORS, Pino (JSON logging estructurado), Rate Limiting  
**Developer Experience**: `npm run dev` (ejecución concurrente), Vite proxy a `http://localhost:4000/api`  
**Constitutional Constraints**: Zero emojis en UI y código, 100% strict typing sin `any`, TDD mandatorio con pruebas previas a la implementación.

---

## 3. Constitution Check

*GATE: Must pass before implementation.*

- **Principio I (Spec-First & Library-First Architecture)**: **APROBADO**. Se formalizan especificación funcional ([spec.md](spec.md)), modelo de datos ([data-model.md](data-model.md)), decisiones de arquitectura ([research.md](research.md)) y contratos de API ([contracts/api.contract.md](contracts/api.contract.md)) previo a cualquier refactorización. El directorio `shared/` actúa como librería fundamental.
- **Principio II (Test-First Quality Assurance - TDD Mandatorio)**: **APROBADO**. Se diseñan pruebas de contrato HTTP para el backend antes de implementar los controladores, y pruebas de integración para el `ApiClient` frontend.
- **Principio III (CLI-First & Text Protocol Interfaces)**: **APROBADO**. La API backend expone una interfaz REST estándar con payloads JSON estructurados que pueden ser consultados y automatizados mediante `curl` o scripts de terminal.
- **Principio IV (Continuous Integration & Observability)**: **APROBADO**. Endpoint de salud `/api/v1/health`, logging estructurado Pino en el backend, y comandos unificados en la raíz (`npm run typecheck`, `npm test`, `npm run build`).
- **Principio V (Simplicity & YAGNI Principle)**: **APROBADO**. Segregación directa en raíz con carpetas `frontend/` y `backend/` sin herramientas pesadas de monorepositorio ni subpaquetes en `packages/`. Persistencia SQLite embebida sin requerir Docker obligatorio para desarrollo local.

---

## 4. Project Structure

```text
githubSpecKit/
├── frontend/                            # Aplicación cliente React 19 + TypeScript + Vite
│   ├── components/                      # RecipeCard, RecipeDetail, RecipeImageCarouselModal, etc.
│   ├── hooks/                           # useRecipeImage, useRecipeImagePreference, etc.
│   ├── styles/                          # theme.css y estilos globales
│   ├── services/                        # Adaptadores de servicio HTTP (consumen backend)
│   ├── api/                             # ApiClient tipado que realiza fetch('/api/v1/...')
│   ├── App.tsx                          # Componente raíz
│   └── main.tsx                         # Punto de entrada de Vite
├── backend/                             # Servidor REST API Node.js + Express
│   ├── controllers/                     # Controladores REST: recipes, images, preferences, planner
│   ├── services/                        # Lógica de dominio, pasarela de imágenes Unsplash, caché LRU
│   ├── repositories/                    # Persistencia SQLite (better-sqlite3 con WAL mode)
│   ├── database/                        # Conexión, esquema DDL, migraciones y seeders
│   ├── app.ts                           # Configuración Express, middlewares (Helmet, CORS) y rutas
│   └── server.ts                        # Bootstrap y arranque del servidor en puerto 4000
├── shared/                              # Contratos, tipos y validaciones compartidas
│   ├── models/                          # Recipe, Allergen, CookingTime, Ingredient, Preference, Plan, ShoppingList
│   └── dto/                             # RecipeDto, ImageDto, PlannerDto, ErrorDto (con esquemas Zod)
├── tests/                               # Suites de pruebas unificadas
│   ├── frontend/                        # Pruebas de componentes y hooks (RTL, Vitest)
│   ├── backend/                         # Pruebas de contrato y endpoints (Supertest, Vitest)
│   └── contract/                        # Pruebas de integración de proveedores
├── data/                                # Directorio de almacenamiento de base de datos SQLite
├── index.html                           # Entrada HTML apuntando a /frontend/main.tsx
├── vite.config.ts                       # Proxy /api -> http://localhost:4000 y root frontend/
├── tsconfig.json                        # Path aliases: @frontend/*, @backend/*, @shared/*
├── vitest.config.ts                     # Configuración de pruebas Vitest unificada
├── package.json                         # Scripts unificados de la aplicación
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

### Phase 1: Shared Models, DTOs & Tooling Setup
- Crear directorio `shared/` con `models/` y `dto/`.
- Extraer modelos limpios de `src/domain/models/` a `shared/models/`.
- Definir DTOs y esquemas Zod en `shared/dto/`.
- Configurar path aliases en `tsconfig.json` (`@shared/*`, `@frontend/*`, `@backend/*`).

### Phase 2: Backend Architecture & Persistence (TDD)
- Configurar servidor Fastify en `backend/` con TypeScript.
- Implementar capa de base de datos SQLite con migraciones y seeder del catálogo en `backend/database/`.
- Implementar pruebas de contrato HTTP en `tests/backend/`.
- Implementar repositorios (`SQLiteRecipeRepository`, `SQLitePreferenceRepository`, `SQLitePlannerRepository`).
- Implementar pasarela de imágenes segura con caché server-side y fallback SVG en `backend/services/`.
- Implementar controladores REST y plugins de seguridad (Helmet, CORS, RateLimit, Pino).

### Phase 3: Frontend Refactoring & API Client Integration
- Migrar componentes, hooks y estilos de `src/` a `frontend/`.
- Implementar `ApiClient` HTTP tipado en `frontend/api/api_client.ts`.
- Adaptar servicios de frontend en `frontend/services/` para consumir la API REST del backend con fallback optimista.
- Actualizar `index.html` y `vite.config.ts` para resolver el punto de entrada en `frontend/main.tsx` y el proxy `/api`.

### Phase 4: Migration Cleanup & Test Consolidation
- Reubicar pruebas de componentes existentes de `src/tests/` a `tests/frontend/` y `tests/backend/`.
- Eliminar de forma segura el directorio legado `src/`.
- Actualizar scripts en `package.json` para ejecución concurrente (`npm run dev`) y compilación limpia (`npm run build`).

### Phase 5: Verification, Convergence & Documentation
- Ejecutar suite de pruebas completa (`npm test`).
- Verificar estricto typecheck (`npm run typecheck`).
- Validar build de producción (`npm run build`).
- Confirmar flujo de usuario de extremo a extremo sin regresiones.
