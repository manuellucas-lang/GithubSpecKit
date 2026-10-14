# Feature Specification: Segregación Frontend y Backend para Arquitectura Profesional

**Feature Branch**: `feature/003-frontend-backend-segregation`  
**Created**: 2026-10-14  
**Status**: Approved Specification  
**Input**: Requerimiento de usuario: "refactor src folder into backend and frontend folders not add into packages folder, to have a frontend and backend folder where right now are src folder"

---

## 1. Executive Summary

La aplicación actual almacena todo su código bajo el directorio `src/`, combinando lógica de presentación React, llamadas directas a APIs externas de imágenes y persistencia confinada a `localStorage`. Para profesionalizar la arquitectura sin incurrir en la sobrecarga ni complejidad de tooling de un monorepositorio con directorio `packages/`, se refactorizará el contenido de `src/` directamente en tres directorios especializados en la raíz del proyecto:

1. `frontend/`: Capa cliente React 19 + TypeScript + Vite (componentes, hooks, vistas, estilos, y cliente API).
2. `backend/`: Servidor de servicios RESTful Node.js + TypeScript + Fastify con persistencia ACID relacional en SQLite (`better-sqlite3`).
3. `shared/`: Modelos de dominio universales, DTOs de comunicación y esquemas de validación Zod compartidos directamente entre cliente y servidor.

Esta segregación desacopla la presentación de las reglas de negocio, custodia claves de API secretas en el servidor y prepara la base para persistencia multi-sesión y evolución a perfiles de usuario.

---

## 2. User Scenarios & Testing

### User Story 1 - Catálogo Centralizado Servido por Backend REST (Priority: P1)

Como usuario de la aplicación, quiero explorar el catálogo de recetas y filtrar por texto o tiempo de cocción obteniendo los datos desde el servidor backend en `http://localhost:4000/api/v1/recipes`, para que la información esté centralizada y no incrustada en el bundle de la interfaz.

- **Why this priority**: Es la funcionalidad troncal. Reemplaza el mock local de recetas en el cliente por un servicio HTTP robusto.
- **Independent Test**: Ejecutar `curl http://localhost:4000/api/v1/recipes` y verificar que el endpoint retorna el catálogo tipado con status 200 y filtrado funcional por query parameters (`search`, `maxCookingMinutes`).
- **Acceptance Scenarios**:
  1. **Given** el servidor backend en ejecución, **When** el cliente solicita `GET /api/v1/recipes`, **Then** recibe la lista de recetas con tiempo de respuesta < 50 ms.
  2. **Given** parámetros de filtro `search=paella&maxCookingMinutes=45`, **When** se envía la solicitud al backend, **Then** responde únicamente con las recetas que cumplen ambos criterios.
  3. **Given** que el backend no está disponible, **When** la aplicación frontend carga, **Then** muestra un estado de error observable con botón de reintento.

---

### User Story 2 - Proxy Seguro y Caché de Imágenes Candidatas en Backend (Priority: P1)

Como usuario que personaliza imágenes de recetas, quiero que las fotos alternativas del carrusel se consulten a través de `GET /api/v1/images/candidates`, protegiendo la clave de API de Unsplash en el servidor y optimizando la cuota con caché en memoria.

- **Why this priority**: Seguridad fundamental. Las credenciales de Unsplash nunca deben viajar al navegador del cliente.
- **Independent Test**: Comprobar que `GET /api/v1/images/candidates?keyword=paella&count=6` devuelve candidatos válidos desde el backend sin que el frontend realice llamadas directas a `api.unsplash.com`.
- **Acceptance Scenarios**:
  1. **Given** una palabra clave válida, **When** el backend recibe la petición, **Then** utiliza su clave de entorno para consultar al proveedor externo o servir desde caché local, retornando al menos 3 candidatos.
  2. **Given** un fallo de red externo o límite de cuota, **When** el backend detecta el error, **Then** genera y devuelve de forma transparente candidatos vectoriales SVG alternativos.
  3. **Given** consultas repetidas para la misma palabra clave, **When** el backend recibe peticiones subsiguientes, **Then** responde desde la caché en memoria en < 10 ms.

---

### User Story 3 - Persistencia de Preferencias y Plan Semanal en SQLite (Priority: P2)

Como usuario del planificador y del catálogo, quiero que mis imágenes seleccionadas y mi menú semanal se almacenen en una base de datos SQLite en el servidor, garantizando persistencia durable.

- **Why this priority**: Supera las limitaciones de `localStorage` y sienta las bases para soporte multi-usuario.
- **Independent Test**: Enviar `PUT /api/v1/preferences/:recipeId` con un candidato de imagen y verificar mediante `GET /api/v1/preferences` que la selección persiste entre reinicios del cliente.
- **Acceptance Scenarios**:
  1. **Given** un candidato seleccionado en el carrusel, **When** el frontend invoca `PUT /api/v1/preferences/:recipeId`, **Then** el backend almacena el registro en SQLite y retorna status 200 con la preferencia actualizada.
  2. **Given** un menú semanal modificado, **When** el usuario asigna una receta a un día en el planificador, **Then** el backend guarda la asignación y computa la lista de compras agregada (`GET /api/v1/shopping-list`).
  3. **Given** una preferencia almacenada, **When** el usuario pulsa restablecer a imagen por defecto, **Then** el endpoint `DELETE /api/v1/preferences/:recipeId` elimina la entrada y retorna confirmación.

---

### User Story 4 - Contratos de Dominio Compartidos sin Duplicación de Código (Priority: P2)

Como desarrollador, quiero que los modelos y DTOs residan en un directorio `shared/` común accesible por `frontend/` y `backend/` mediante path aliases de TypeScript (`@shared/*`), garantizando consistencia de tipos sin requerir publicación de paquetes npm.

- **Why this priority**: Garantiza type-safety estricto de extremo a extremo sin complejidad de paquetes separados.
- **Independent Test**: Ejecutar `npm run typecheck` y verificar que tanto el backend como el frontend consumen `@shared/*` sin errores de compilación ni uso de `any`.
- **Acceptance Scenarios**:
  1. **Given** esquemas Zod en `shared/dto/`, **When** el backend recibe una petición con campos inválidos, **Then** responde con status 400 y detalle de validación RFC 7807.
  2. **Given** las interfaces en `shared/models/`, **When** el frontend tipa sus hooks y componentes, **Then** se valida en tiempo de compilación la coincidencia con los datos del servidor.

---

## 3. Functional Requirements (FR)

- **FR-001**: El directorio monolítico `src/` debe refactorizarse en tres directorios raíz: `frontend/`, `backend/` y `shared/`, eliminando `src/`.
- **FR-002**: `shared/` contendrá los modelos de dominio (`models/`), DTOs de comunicación (`dto/`) y esquemas de validación Zod (`schemas/`) compartidos directamente entre cliente y servidor.
- **FR-003**: `backend/` implementará un servidor RESTful con Fastify (o Express) sirviendo en el prefijo `/api/v1` con puerto por defecto `4000`.
- **FR-004**: El backend implementará endpoints REST para:
  - `GET /api/v1/recipes`: Listado filtrable de recetas (`search`, `maxCookingMinutes`, `difficulty`, `tag`).
  - `GET /api/v1/recipes/:id`: Detalle completo de una receta.
  - `GET /api/v1/images/candidates`: Búsqueda segura de imágenes con caché y respaldo SVG.
  - `GET /api/v1/preferences`: Obtención de todas las preferencias de imagen.
  - `PUT /api/v1/preferences/:recipeId`: Persistencia de selección de imagen.
  - `DELETE /api/v1/preferences/:recipeId`: Restablecimiento de imagen a la original.
  - `GET /api/v1/planner`: Obtención del plan semanal actual.
  - `PUT /api/v1/planner`: Actualización de asignaciones del plan semanal.
  - `GET /api/v1/shopping-list`: Cálculo y agregación de lista de compras.
  - `GET /api/v1/health`: Diagnóstico de salud y estado del servicio.
- **FR-005**: El backend persistirá los datos en SQLite embebido (`better-sqlite3`) con modo WAL activado y migraciones automáticas en arranque.
- **FR-006**: El backend integrará middleware de seguridad: Helmet (cabeceras HTTP), CORS configurado para el frontend, Rate Limiting y logging estructurado en formato JSON con Pino.
- **FR-007**: `frontend/` contendrá la aplicación React 19 + Vite, configurando `vite.config.ts` para redirigir peticiones `/api` al backend en `http://localhost:4000`.
- **FR-008**: `frontend/` reemplazará las llamadas directas a almacenamiento local y APIs externas por un cliente HTTP tipado (`ApiClient`) con manejo reactivo de estados de carga y error.
- **FR-009**: `package.json` en la raíz coordinará todos los scripts de ejecución:
  - `npm run dev`: Ejecución concurrente de backend y frontend.
  - `npm run dev:frontend`: Ejecución exclusiva de la interfaz Vite.
  - `npm run dev:backend`: Ejecución exclusiva del servidor Fastify con recarga automática.
  - `npm run build`: Compilación de producción para frontend y backend.
  - `npm test`: Ejecución de pruebas unitarias y de contrato en `tests/`.
  - `npm run typecheck`: Verificación estricta de TypeScript en toda la base de código.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-001 (Performance)**: Tiempo de respuesta del backend < 50 ms para lecturas en frío y < 10 ms para respuestas cacheadas en memoria.
- **NFR-002 (Security)**: Claves secretas de APIs externas (Unsplash) custodiadas exclusivamente en variables de entorno del servidor.
- **NFR-003 (Observability)**: Logging estructurado en formato JSON (Pino) con ID de petición, método, ruta, código de estado y latencia.
- **NFR-004 (Reliability)**: Manejo centralizado de excepciones con respuestas de error estandarizadas en formato RFC 7807 (Problem Details).
- **NFR-005 (Constitutional Alignment)**: Cumplimiento de la Constitución del proyecto: cero emojis en código e interfaz, 100% tipado estricto sin `any`, y TDD mandatorio con pruebas previas a la implementación.
