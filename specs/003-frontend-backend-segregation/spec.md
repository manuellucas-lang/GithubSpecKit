# Feature Specification: Segregación Frontend y Backend para Arquitectura Profesional

**Feature Branch**: `feature/003-frontend-backend-segregation`  
**Created**: 2026-10-14  
**Status**: Approved Specification  
**Input**: Requerimiento de usuario: "planify a frontend backend segregation to make the app professional"

---

## 1. Executive Summary

La aplicación culinaria actual opera como una SPA (*Single Page Application*) cliente pura donde los datos mock de recetas, las consultas a APIs externas de imágenes y la persistencia en `localStorage` conviven en el mismo paquete cliente. Para alcanzar un estándar profesional de ingeniería de software, se requiere una segregación estricta entre Frontend y Backend en una estructura monorepositorio con espacios de trabajo (*workspaces*).

Esta arquitectura desacopla la capa de presentación (React 19 + TypeScript + Vite) del servidor de servicios de aplicación (Node.js + TypeScript + Fastify/Express con persistencia relacional SQLite), centralizando las reglas de negocio, protegiendo credenciales de APIs de terceros mediante un proxy seguro, y exponiendo una interfaz RESTful estructurada bajo contratos compartidos (*Shared DTOs*).

---

## 2. User Scenarios & Testing

### User Story 1 - Consulta y Filtrado de Catálogo a través de API REST (Priority: P1)

Como usuario de la aplicación, quiero explorar el catálogo de recetas y aplicar filtros dinámicos (búsqueda textual, tiempo máximo de cocción y etiquetas) obteniendo los datos desde un servicio backend centralizado, para asegurar coherencia y tiempos de respuesta ágiles.

- **Why this priority**: Es la funcionalidad troncal de la aplicación. Desacoplar la fuente de recetas del bundle cliente es la base indispensable de la arquitectura cliente-servidor.
- **Independent Test**: Se puede verificar de forma autónoma realizando llamadas HTTP `GET /api/v1/recipes?search=paella&maxTime=45` al servidor backend y comprobando que el frontend renderiza la lista reactivamente sin depender de arrays estáticos en memoria.
- **Acceptance Scenarios**:
  1. **Given** un catálogo poblado en el backend, **When** el cliente solicita `GET /api/v1/recipes`, **Then** el servidor responde con status 200 y una lista paginada/filtrable de recetas tipadas.
  2. **Given** un filtro de búsqueda con parámetros `search` y `maxCookingMinutes`, **When** el usuario interactúa con la barra de búsqueda en el frontend, **Then** el cliente emite una petición con query params y el backend retorna únicamente los registros coincidentes.
  3. **Given** que el backend se encuentra temporalmente inaccesible, **When** el cliente inicia la carga, **Then** el frontend presenta un estado de error observable con reintento sin romper la interfaz.

---

### User Story 2 - Proxy Seguro y Caché de Imágenes Candidatas en Backend (Priority: P1)

Como usuario que personaliza imágenes de recetas, quiero que la búsqueda y obtención de imágenes candidatas se tramite a través de un proxy backend, protegiendo las credenciales de proveedores externos (Unsplash API) y optimizando el consumo de cuota mediante caché server-side.

- **Why this priority**: Exponer tokens de autenticación o API keys en el bundle frontend es una vulnerabilidad de seguridad crítica. El backend debe actuar como custodio de secretos y pasarela de resiliencia.
- **Independent Test**: Comprobar que el endpoint `GET /api/v1/images/candidates?keyword=paella&count=6` responde con candidatos enriquecidos sin que el frontend incluya tokens ni URLs directas de proveedores externos en sus peticiones de red.
- **Acceptance Scenarios**:
  1. **Given** una palabra clave válida, **When** el cliente solicita candidatos a través del backend, **Then** el servidor consulta su caché o el proveedor remoto con su API key secreta y devuelve la colección normalizada (mínimo 3 candidatos).
  2. **Given** una caída o agotamiento de cuota del proveedor externo, **When** el backend procesa la solicitud, **Then** genera y devuelve de forma transparente la suite de respaldo vectorial SVG garantizando continuidad de servicio.
  3. **Given** consultas repetidas para la misma receta, **When** varios clientes solicitan candidatos, **Then** el backend sirve la respuesta desde su caché en memoria / redis-ready en < 50 ms.

---

### User Story 3 - Persistencia Centralizada de Preferencias y Planificación Semanal (Priority: P2)

Como usuario habitual, quiero que mis imágenes seleccionadas y mi planificación de menú semanal se almacenen en una base de datos backend, permitiendo la sincronización entre sesiones y navegadores.

- **Why this priority**: `localStorage` está confinado a un único navegador y dispositivo. La persistencia en backend profesionaliza la aplicación permitiendo persistencia multi-sesión y evolución a perfiles de usuario.
- **Independent Test**: Modificar la imagen de una receta o planificar un día mediante `PUT /api/v1/preferences/:recipeId` y `PUT /api/v1/planner`, y verificar mediante un cliente HTTP independiente o una nueva sesión de navegador que el estado persiste fielmente.
- **Acceptance Scenarios**:
  1. **Given** una receta existente, **When** el usuario selecciona una imagen candidata en el carrusel, **Then** el frontend invoca `PUT /api/v1/preferences/:recipeId` y el backend persiste la preferencia en la base de datos relacional.
  2. **Given** un menú semanal planificado, **When** el usuario asigna una receta al lunes en el almuerzo, **Then** el backend actualiza la entidad del planificador y computa la lista de compras asociada (`GET /api/v1/shopping-list`).
  3. **Given** una preferencia almacenada, **When** el usuario pulsa restablecer imagen por defecto, **Then** se ejecuta `DELETE /api/v1/preferences/:recipeId` y el backend elimina el registro devolviendo status 204/200.

---

### User Story 4 - Contratos Compartidos y Validación Estricta de Tipos (Priority: P2)

Como desarrollador del proyecto, quiero que los modelos de dominio, DTOs y validaciones de esquema sean compartidos entre frontend y backend a través de un paquete interno (`@recipe-app/shared`), evitando divergencias de tipos y garantizando type-safety de extremo a extremo.

- **Why this priority**: Garantiza que ningún cambio en la API rompa el cliente en tiempo de compilación (`npm run typecheck`).
- **Independent Test**: Modificar un campo en un contrato compartido y verificar que tanto el backend como el frontend reportan errores de compilación estática si no se alinean.
- **Acceptance Scenarios**:
  1. **Given** esquemas de validación Zod en el paquete compartido, **When** el backend recibe un payload inválido en un endpoint `PUT`/`POST`, **Then** rechaza la solicitud con status 400 y mensaje detallado de validación.
  2. **Given** las interfaces compartidas, **When** el cliente tipa las respuestas del API client, **Then** no se utiliza `any` en ninguna capa de la aplicación.

---

## 3. Functional Requirements (FR)

- **FR-001**: La raíz del repositorio debe organizarse en espacios de trabajo (*npm workspaces*) estructurados en `packages/frontend`, `packages/backend` y `packages/shared`.
- **FR-002**: `packages/shared` debe contener los tipos TypeScript, constantes de dominio, interfaces DTO y esquemas de validación comunes sin dependencias de DOM ni de Node runtime.
- **FR-003**: `packages/backend` debe implementar una API REST estructurada con Node.js, TypeScript y Fastify (o Express) sirviendo en el prefijo `/api/v1`.
- **FR-004**: El backend debe implementar endpoints para:
  - `GET /api/v1/recipes`: Listado de recetas con filtros (`search`, `maxCookingTime`, `difficulty`, `tags`).
  - `GET /api/v1/recipes/:id`: Detalle completo de una receta.
  - `GET /api/v1/images/candidates`: Búsqueda de imágenes alternativas con gestión interna de API keys y fallback.
  - `GET /api/v1/preferences`: Obtención de todas las preferencias de imagen persistidas.
  - `PUT /api/v1/preferences/:recipeId`: Persistencia de selección de imagen para una receta.
  - `DELETE /api/v1/preferences/:recipeId`: Restablecimiento de imagen a la original.
  - `GET /api/v1/planner`: Obtención del plan semanal actual.
  - `PUT /api/v1/planner`: Actualización de asignaciones del planificador semanal.
  - `GET /api/v1/shopping-list`: Cálculo y agregación de lista de compras en base al plan semanal.
  - `GET /api/v1/health`: Endpoint de diagnóstico y salud del servicio.
- **FR-005**: El backend debe persistir los datos en una base de datos relacional ligera SQLite gestionada mediante repositorio tipado, permitiendo ejecución inmediata sin requerir la instalación de servicios externos en desarrollo local.
- **FR-006**: El backend debe incorporar middleware de seguridad estándar: Helmet para cabeceras HTTP, CORS configurado para el origen del frontend, limitador de tasa (*rate limiting*) y logging estructurado en formato JSON (Pino).
- **FR-007**: `packages/frontend` debe configurar un proxy en Vite (`vite.config.ts`) para redirigir las peticiones `/api` al backend local durante el desarrollo sin problemas de CORS.
- **FR-008**: `packages/frontend` debe sustituir el almacenamiento exclusivo en `localStorage` por un cliente HTTP tipado (`ApiClient`) con soporte para sincronización optimista y manejo de errores de conexión.
- **FR-009**: La suite de scripts en la raíz del monorepositorio debe permitir `npm run dev` (ejecución concurrente de frontend y backend), `npm run build`, `npm run typecheck` y `npm test` de forma unificada.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-001 (Performance)**: Tiempo de respuesta del backend < 50 ms para endpoints de lectura en frío y < 10 ms para respuestas cacheadas.
- **NFR-002 (Security)**: Ninguna clave de API secreta ni credencial privada debe exponerse en el bundle de distribución del frontend.
- **NFR-003 (Observability)**: Toda petición HTTP al backend debe registrarse con ID de traza, método, ruta, código de estado y tiempo de respuesta en formato JSON estructurado.
- **NFR-004 (Reliability)**: El servidor debe manejar excepciones no controladas sin terminar el proceso de forma anómala, retornando respuestas HTTP 500 normalizadas en formato RFC 7807 (Problem Details).
- **NFR-005 (Constitutional Alignment)**: Conformidad total con la Constitución del proyecto: desarrollo guiado por pruebas (TDD), estricto `no-any` en TypeScript, y cero emojis en código e interfaz.
