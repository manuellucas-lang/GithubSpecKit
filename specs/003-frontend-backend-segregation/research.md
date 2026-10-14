# Research & Architectural Decisions: Segregación Frontend y Backend

**Feature**: `003-frontend-backend-segregation`  
**Date**: 2026-10-14  
**Status**: Completed Research (Phase 0)

---

## 1. Directory Structure Strategy: Direct Segregation vs. Packages Monorepo

### Context
El código actual reside en un directorio único `src/`. Se evaluó la conveniencia de estructurar el proyecto mediante subpaquetes en `packages/` frente a segregar directamente en carpetas `frontend/`, `backend/` y `shared/` en la raíz del proyecto (reemplazando `src/`).

### Evaluation of Alternatives

| Alternativa | Complejidad de Tooling | Compartición de Tipos | Sencillez de Scripts y CI | Decisión |
| :--- | :--- | :--- | :--- | :--- |
| **Direct Root Segregation (`frontend/`, `backend/`, `shared/`)** | Mínima. Un único `package.json` y `tsconfig.json` con path aliases (`@frontend/*`, `@backend/*`, `@shared/*`). | Inmediata sin necesidad de compilar paquetes intermedios a `dist/`. | Máxima. `npm run dev`, `npm test` y `npm run typecheck` operan sin scripts concatenados ni enlaces simbólicos. | **SELECCIONADA**: Alineación absoluta con el **Principio V (Simplicidad & YAGNI)**. Evita la sobreingeniería de monorepositorios multinivel para una aplicación de un solo equipo. |
| **Monorepo con `packages/*`** | Alta. Requiere configurar workspaces en npm, múltiples `package.json`, compilación previa de `@shared` a `dist/`, y gestión de symlinks. | Requiere compilación de declaraciones `.d.ts` previas al consumo en frontend y backend. | Moderada. Fricción si la compilación de un paquete falla antes del arranque de los demás. | **Descartada**: Rechazada explícitamente para evitar la sobrecarga de gestión de paquetes. |

### Selected Layout
```text
githubSpecKit/
├── frontend/                     # Aplicación cliente React 19 + TypeScript + Vite
│   ├── components/               # RecipeCard, RecipeDetail, RecipeImageCarouselModal, etc.
│   ├── hooks/                    # useRecipeImage, useRecipeImagePreference, etc.
│   ├── styles/                   # theme.css y estilos globales
│   ├── services/                 # Adaptadores de servicio HTTP (consumen backend)
│   ├── api/                      # ApiClient tipado que realiza fetch('/api/v1/...')
│   ├── App.tsx                   # Componente raíz
│   └── main.tsx                  # Punto de entrada de Vite
├── backend/                      # Servidor API Node.js + TypeScript + Express
│   ├── controllers/              # Controladores REST: recipes, images, preferences, planner
│   ├── services/                 # Lógica de dominio, pasarela de imágenes Unsplash, caché LRU
│   ├── repositories/             # Persistencia SQLite (better-sqlite3 en modo WAL)
│   ├── database/                 # Conexión, esquema DDL, migraciones y seeders
│   ├── app.ts                    # Configuración Express, middlewares (Helmet, CORS) y rutas
│   └── server.ts                 # Bootstrap y arranque del servidor en puerto 4000
├── shared/                       # Modelos, DTOs y validaciones compartidas
│   ├── models/                   # Recipe, Allergen, CookingTime, Ingredient, Preference, Plan, ShoppingList
│   └── dto/                      # RecipeDto, ImageDto, PlannerDto, ErrorDto (con esquemas Zod)
├── tests/                        # Suites de pruebas estructuradas
│   ├── frontend/                 # Pruebas de componentes y hooks (RTL, Vitest)
│   ├── backend/                  # Pruebas de contrato y endpoints (Supertest, Vitest)
│   └── contract/                 # Pruebas de proveedores e integración
├── index.html                    # Entrada HTML apuntando a /frontend/main.tsx
├── vite.config.ts                # Vite configurado con root/entry en frontend/ y proxy /api -> :4000
├── tsconfig.json                 # Path aliases: @frontend/*, @backend/*, @shared/*
├── vitest.config.ts              # Configuración de pruebas Vitest unificada
└── package.json                  # Scripts unificados de la aplicación
```

---

## 2. Backend Framework Selection

### Context
El servidor backend debe proporcionar endpoints RESTful, validación de esquemas, middleware de seguridad, proxy de imágenes y logging estructurado en JSON.

### Decision: Node.js + Express con TypeScript y Zod
- **Madurez y Estabilidad**: Ecosistema robusto y probado, con compatibilidad directa con middlewares estándar (`helmet`, `cors`).
- **Type-Safety & Validación**: Validación declarativa de peticiones con esquemas Zod en `shared/dto/` compartidos con el cliente React.
- **Manejo Centralizado de Errores**: Middleware de error conforme al estándar RFC 7807 (Problem Details).
- **Simplicidad Arquitectural**: Enrutamiento modular limpio (`recipeRouter`, `imageRouter`, `preferenceRouter`, `plannerRouter`) sin overhead de plugins complejos.

---

## 3. Persistence & Database Strategy

### Context
La aplicación necesita persistir recetas, preferencias de imagen y planes semanales en el servidor de forma confiable sin obligar a los desarrolladores a instalar bases de datos externas como PostgreSQL o Docker para desarrollo local.

### Decision: SQLite 3 via `better-sqlite3`
- **ACID & Concurrencia**: Ejecución en modo WAL (*Write-Ahead Logging*) que permite lecturas concurrentes sin bloquear escrituras.
- **Cero Dependencias Externas**: La base de datos reside en un archivo local (`data/recipes.db`), permitiendo clonar el repositorio, ejecutar `npm test` o `npm run dev` y trabajar de inmediato.
- **Arquitectura de Repositorio**: Los repositorios (`SQLiteRecipeRepository`, `SQLitePreferenceRepository`, `SQLitePlannerRepository`) implementan interfaces abstractas, permitiendo migrar a PostgreSQL o MySQL en el futuro sin modificar los servicios de dominio.

---

## 4. API Security & External Proxying

### Context
El cliente actual invoca la API de Unsplash directamente, lo que expondría tokens de autenticación o API keys en el bundle de producción del navegador.

### Architecture Pattern
1. **Proxy Gateway**: El frontend realiza llamadas a `GET /api/v1/images/candidates?keyword=:keyword`.
2. **Encapsulamiento de Credenciales**: El backend almacena `UNSPLASH_ACCESS_KEY` en variables de entorno del servidor (`.env`), inalcanzables desde el navegador del cliente.
3. **Caché Server-Side**: Las peticiones de candidatos se almacenan en una caché en memoria con TTL de 24 horas (`lru-cache` / `node-cache`), reduciendo el consumo de cuota externa en un 95%.
4. **Circuito de Fallback**: Si el proveedor externo falla o agota la cuota (HTTP 429), el backend genera la respuesta SVG alternativa y la retorna con cabeceras de caché adecuadas.

---

## 5. Development Proxy & Seamless Integration

### Context
Evitar problemas de CORS y discrepancia de puertos durante el desarrollo local entre Vite (puerto 5173) y el backend Fastify (puerto 4000).

### Implementation
En `vite.config.ts`:
```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```
Esto permite al frontend realizar `fetch('/api/v1/recipes')` sin hardcodear URLs absolutas, funcionando de manera idéntica en desarrollo local y en producción detrás de un reverse proxy (como NGINX o Cloudflare).
