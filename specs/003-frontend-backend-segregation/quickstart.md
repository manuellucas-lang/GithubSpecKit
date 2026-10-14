# Quickstart & Verification Guide: Frontend & Backend Segregation

**Feature**: `003-frontend-backend-segregation`  
**Date**: 2026-10-14  

---

## 1. Prerequisites

- **Node.js**: v20+ LTS
- **npm**: v10+ (con soporte para npm workspaces)

---

## 2. Quickstart Execution Commands

### Installation
Instala las dependencias en la raíz del monorepositorio resolviendo los enlaces simbólicos de los espacios de trabajo (`shared`, `backend`, `frontend`):
```bash
npm install
```

### Development Mode (Concurrent)
Ejecuta simultáneamente el backend en el puerto `4000` y el frontend en el puerto `5173`:
```bash
npm run dev
```

El servidor Vite en `http://localhost:5173` redirige automáticamente cualquier petición `/api/*` a `http://localhost:4000/api/*`.

---

## 3. Automated Verification Gates

### 1. Static Type Checking
Verifica la conformidad estricta de tipos en todos los paquetes del monorepositorio:
```bash
npm run typecheck
```

### 2. Automated Test Suite (Unit & Contract)
Ejecuta las pruebas en frontend, backend y contratos compartidos:
```bash
npm test
```

### 3. Production Build Validation
Compila los paquetes en orden de dependencias (`shared` -> `backend` + `frontend`):
```bash
npm run build
```

---

## 4. Manual API Verification with cURL

Una vez iniciado el backend (`npm run dev`):

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
