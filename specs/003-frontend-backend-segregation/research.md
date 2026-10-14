# Research & Architectural Decisions: Segregación Frontend y Backend

**Feature**: `003-frontend-backend-segregation`  
**Date**: 2026-10-14  
**Status**: Completed Research (Phase 0)

---

## 1. Monorepo Workspaces Strategy

### Context
El proyecto actual es un único paquete npm centrado en la compilación de Vite. Para profesionalizar la arquitectura, se requiere segregar responsabilidades sin dispersar el código en múltiples repositorios que dificulten la sincronización de tipos y el versionado conjunto.

### Evaluation of Alternatives

| Alternativa | Ventajas | Desventajas | Decisión |
| :--- | :--- | :--- | :--- |
| **npm Workspaces (Nativo)** | Soporte estándar incluido en Node/npm; cero herramientas extra que instalar; configuración trivial en `package.json`. | Menor caché avanzada de compilación en proyectos de escala masiva (>50 paquetes). | **SELECCIONADA**: Respeta el Principio V (Simplicidad y YAGNI). Ideal para monorepos de 3 paquetes (`frontend`, `backend`, `shared`). |
| **Turborepo / Nx** | Caché remota y ejecución paralela optimizada de tareas. | Dependencias binarias pesadas y complejidad de configuración excesiva para el tamaño del proyecto. | **Descartada**: Violación del principio YAGNI en esta fase. |
| **Multi-repo (Repositorios separados)** | Aislamiento estricto de despliegues. | Fricción para versionar contratos compartidos; requeriría publicar paquetes npm privados o submódulos git. | **Descartada**: Ralentiza el ciclo de desarrollo y rompe la atomicidad de cambios en PRs. |

### Selected Layout
```text
githubSpecKit/
├── package.json               # Root workspace manifest: "workspaces": ["packages/*"]
├── packages/
│   ├── shared/                # DTOs, interfaces de dominio, esquemas de validación Zod
│   ├── backend/               # Node.js + TypeScript + Fastify REST API Server
│   └── frontend/              # React 19 + TypeScript + Vite SPA
├── specs/                     # Especificaciones de SpecKit
└── .github/                   # Workflows de CI unificados
```

---

## 2. Backend Framework Selection

### Context
El backend debe proveer endpoints RESTful, validación de esquemas, middleware de seguridad, proxy de imágenes y logging estructurado.

### Evaluation of Alternatives

| Framework | Rendimiento | Type-Safety | Ecosistema / Ergonomía | Decisión |
| :--- | :--- | :--- | :--- | :--- |
| **Fastify** | Excepcional (>70k req/s) | Excelente soporte nativo para TypeScript y Zod | Logger Pino integrado, arquitectura de plugins limpia, serialización rápida. | **SELECCIONADA (Recomendada)**: Máxima robustez, menor latencia y observabilidad nativa. |
| **Express 4/5** | Moderado (~15k req/s) | Requiere librerías externas y tipado manual | Ampliamente conocido, pero requiere múltiples middlewares adicionales para seguridad y logging. | **Alternativa Viable**: Fácilmente sustituible si el equipo prefiere Express clásico. |
| **NestJS** | Alto | Basado en decoradores y DI | Curva de aprendizaje empinada, sobrecarga conceptual innecesaria para microservicios REST. | **Descartada**: Sobrecarga de abstracciones innecesaria. |

---

## 3. Persistence & Database Strategy

### Context
Actualmente las preferencias y el planificador semanal dependen exclusivamente del `localStorage` del navegador. Para profesionalizar la arquitectura, se necesita una capa de datos persistente en el servidor.

### Evaluation of Alternatives

| Estrategia | Despliegue Local / CI | Concurrencia / ACID | Escalabilidad | Decisión |
| :--- | :--- | :--- | :--- | :--- |
| **SQLite (via better-sqlite3)** | Inmediato (archivo local `data/recipes.db`, cero dependencias de servicios externos) | Transacciones ACID completas con modo WAL | Ideal para aplicaciones independientes, embebidas o contenedores individuales. | **SELECCIONADA**: Permite ejecutar pruebas unitarias y de contrato en CI sin levantar contenedores Docker adicionales. |
| **PostgreSQL** | Requiere Docker o servicio administrado externo | Robusta para concurrencia masiva | Estándar de la industria para microservicios a gran escala. | **Fase Futura**: La capa de repositorio desacoplada facilitará migrar a PostgreSQL cuando la escala lo demande. |
| **In-Memory / Archivos JSON** | Cero configuración | Sin concurrencia segura ni integridad referencial | Inadecuado para entornos de producción. | **Descartada**: Insuficiente para un estándar profesional. |

---

## 4. API Security & External Proxying

### Context
El cliente invoca la API de Unsplash directamente. Exponer el token de acceso de Unsplash en el frontend compromete la seguridad y la cuota de la cuenta.

### Architecture Pattern
1. **Proxy Gateway**: El frontend realiza llamadas a `GET /api/v1/images/candidates?keyword=:keyword`.
2. **Encapsulamiento de Credenciales**: El backend almacena `UNSPLASH_ACCESS_KEY` en variables de entorno del servidor (`.env`), inalcanzables desde el navegador del cliente.
3. **Caché en Servidor**: Las peticiones a imágenes se almacenan en memoria con TTL de 24 horas (`node-cache` o `lru-cache`), reduciendo el consumo de cuota externa en un 95%.
4. **Circuito de Fallback**: Si el proveedor externo falla o agota la cuota (HTTP 429), el backend genera la respuesta SVG alternativa y la retorna con cabeceras de caché adecuadas.

---

## 5. Development Proxy & Seamless Integration

### Context
Evitar problemas de CORS y puertos dispares durante el desarrollo local entre Vite (puerto 5173) y el backend Fastify (puerto 4000).

### Implementation
En `packages/frontend/vite.config.ts`:
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
