# Quickstart & Verification Guide: Frontend & Backend Segregation

**Feature**: `003-frontend-backend-segregation`  
**Date**: 2026-10-14  

---

## 1. Prerequisites

- **Node.js**: v20+ LTS
- **npm**: v10+

---

## 2. Directory Layout

```text
githubSpecKit/
├── frontend/             # React 19 + TypeScript + Vite SPA
├── backend/              # Node.js + Fastify REST API Server
├── shared/               # Domain Models, DTOs & Validation Schemas
├── tests/                # Frontend & Backend Automated Tests
├── data/                 # SQLite Database (recipes.db)
└── specs/                # Spec Kit Specifications
```

---

## 3. Execution Commands

### Installation
Instala las dependencias del proyecto en la raíz:
```bash
npm install
```

### Development Mode (Concurrent)
Ejecuta simultáneamente el backend en el puerto `4000` y el frontend en el puerto `5173`:
```bash
npm run dev
```

El servidor Vite en `http://localhost:5173` redirige automáticamente cualquier petición `/api/*` a `http://localhost:4000/api/*`.

### Independent Execution
- **Solo Frontend**:
  ```bash
  npm run dev:frontend
  ```
- **Solo Backend**:
  ```bash
  npm run dev:backend
  ```

---

## 4. Automated Verification Gates

### 1. Static Type Checking
Verifica la conformidad estricta de tipos en `frontend/`, `backend/` y `shared/`:
```bash
npm run typecheck
```

### 2. Automated Test Suite (Unit & Contract)
Ejecuta las pruebas en frontend y backend:
```bash
npm test
```

### 3. Production Build Validation
Compila los componentes de frontend y el servidor backend:
```bash
npm run build
```

---

## 5. Manual API Verification with cURL

Una vez iniciado el backend (`npm run dev` o `npm run dev:backend`):

- **Healthcheck**:
  ```bash
  curl http://localhost:4000/api/v1/health
  ```
- **Catálogo de recetas**:
  ```bash
  curl "http://localhost:4000/api/v1/recipes?search=paella"
  ```
- **Candidatos de imágenes seguros**:
  ```bash
  curl "http://localhost:4000/api/v1/images/candidates?keyword=paella&count=6"
  ```
