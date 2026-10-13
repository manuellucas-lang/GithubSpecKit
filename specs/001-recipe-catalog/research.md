# Research & Architecture Decisions: Catálogo de Recetas Web

**Feature**: `001-recipe-catalog`  
**Status**: Completed  
**Date**: 2026-10-13  

---

## 1. Arquitectura de Aplicación Web y React 19

### Decision
Utilizar **React 19** con **Vite** y **TypeScript 5.x**, estructurado con arquitectura modular desacoplada (*Library-First*):
- Núcleo de dominio (`recipe-domain`): modelos de datos puros, cálculos de tiempos y lógica de alérgenos sin dependencias de UI.
- Servicio de imágenes (`image-client`): cliente tipado desacoplado para consulta por palabra clave.
- Capa de presentación (`recipe-ui`): componentes de interfaz en React 19 haciendo uso de `Suspense`, `useTransition`, `ErrorBoundary` y soporte nativo para carga asíncrona de recursos.

### Rationale
- **React 19** introduce mejoras clave en el manejo asíncrono de acciones, transiciones no bloqueantes (`useTransition`) y soporte unificado de `Suspense` para imágenes y datos asíncronos.
- **Vite** ofrece tiempos de compilación instantáneos en desarrollo y empaquetado optimizado en producción con soporte completo para React 19.
- El enfoque *Library-First* cumple con el **Principio I de la Constitución del Proyecto**, permitiendo probar la lógica de recetas y alérgenos de forma aislada sin requerir montaje de DOM.

### Alternatives Considered
- **Next.js (App Router)**: Proporciona SSR, pero introduce complejidad de servidor innecesaria para un visor de catálogo centrado en cliente con consumo de API externa (*Principio V - YAGNI*).
- **Vanilla JS**: Muy ligero, pero la directriz del usuario exige explícitamente React 19 y ecosistema de plugins para una interfaz profesional y reactiva.

---

## 2. API de Carga de Imágenes por Palabra Clave (*Keyword*)

### Decision
Integrar un adaptador abstracto `ImageProvider` con implementación primaria para **Unsplash API** (o **Pexels API**) y un proveedor simulado local/fallback con imágenes gastronómicas curadas y soporte para fallos de red.
- Parámetro de consulta: `keyword` (ej. `paella`, `risotto`, `ramen`, `chocolate-cake`).
- Estrategia de cache: Cache en memoria/sessionStorage para evitar llamadas redundantes a la misma palabra clave y respetar límites de cuota de la API.
- Mecanismo de Fallback: Imagen SVG vectorizada gastronómica con gradiente y tipografía elegante ante errores de red, respuestas vacías o cuota superada (HTTP 429).

### Rationale
- Unsplash y Pexels ofrecen las mejores bibliotecas de fotografía culinaria en alta definición con endpoints de búsqueda por término (`/search/photos?query={keyword}`).
- Diseñar la interfaz como un contrato desacoplado (`IImageProvider`) permite cambiar de proveedor sin modificar los componentes de la interfaz de usuario.
- El fallback visual predeterminado garantiza el cumplimiento del requisito **FR-004** y el caso límite de fallo de API.

### Alternatives Considered
- **LoremFlickr / Unsplash Source (Deprecado)**: Inestables y carecen de control sobre metadatos de autoría y resoluciones precisas.
- **Pixabay API**: Alternativa sólida, pero menor consistencia en estilo fotográfico gastronómico moderno comparado con Unsplash/Pexels.
- **Imágenes estáticas fijas**: No cumpliría con el requerimiento expreso del usuario de cargar dinámicamente desde una API por palabra clave.

---

## 3. Estándar de Alérgenos y Modelo Nutricional

### Decision
Adoptar la **normativa internacional de los 14 alérgenos de declaración obligatoria** (Reglamento UE 1169/2011), codificados con identificadores estandarizados y metadatos visuales:
1. `GLUTEN` (Cereales con gluten)
2. `CRUSTACEANS` (Crustáceos)
3. `EGGS` (Huevos)
4. `FISH` (Pescado)
5. `PEANUTS` (Cacahuetes)
6. `SOY` (Soja)
7. `DAIRY` (Lácteos)
8. `NUTS` (Frutos de cáscara)
9. `CELERY` (Apio)
10. `MUSTARD` (Mostaza)
11. `SESAME` (Sésamo)
12. `SULPHITES` (Sulfitos / Dióxido de azufre)
13. `LUPIN` (Altramuces)
14. `MOLLUSCS` (Moluscos)

### Rationale
- Proporciona un marco legal y médico riguroso, evitando ambigüedades en la seguridad del usuario.
- Permite asignar insignias visuales reconocibles (*badges*) con colores estandarizados y textos de advertencia accesibles.
- Facilita la implementación de filtros de exclusión fiables ("Sin Gluten", "Sin Lácteos").

### Alternatives Considered
- **Texto libre en cada ingrediente**: Propenso a errores humanos y no permite filtrado estructurado o validaciones automáticas.
- **Lista reducida a 4 alérgenos**: Insuficiente para usuarios con intolerancias menos comunes pero severas (ej. apio o sésamo).

---

## 4. Diseño Visual Profesional, Tipografía y Componentes

### Decision
Definir un sistema de diseño visual profesional basado en:
- **Paleta Cromática**: Tema claro y oscuro refinado con tonos neutros profundos (Slate/Zinc), acentos cálidos gastronómicos (ámbar/naranja tostado para tiempos, verde esmeralda para recetas libres de alérgenos, rojo coral suave para advertencias de alérgenos).
- **Tipografía**: Fuentes modernas para legibilidad óptima (Inter / Plus Jakarta Sans para cuerpo y encabezados).
- **Componentes Visuales**:
  - *RecipeCard*: Tarjetas con bordes redondeados sutiles, microinteracciones de elevación (`hover:shadow-lg`), badges flotantes de tiempo y alérgenos.
  - *RecipeDetailModal / View*: Ficha inmersiva con desglose de ingredientes, tiempos en métricas visuales y pasos numerados.
  - *SkeletonLoader*: Pantallas de carga con efecto de pulso para imágenes y textos.
  - *AllergenBadge*: Indicadores con icono y tooltip explicativo.
- **Iconografía**: `lucide-react` para iconos de reloj, fuego, porciones y alertas alimentarias.

### Rationale
- Cumple directamente con el requerimiento de una estética visual profesional de primer nivel (*wow effect*).
- Las transiciones sutiles y los esqueletos de carga comunican fluidez y robustez mientras la API de imágenes responde.

### Alternatives Considered
- **Plantillas prefabricadas genéricas**: Suelen carecer de la personalización semántica requerida para alérgenos y tiempos culinarios.
- **CSS plano sin sistema de tokens**: Difícil de mantener y propenso a inconsistencias cromáticas.

---

## 5. Estrategia de Pruebas y Aseguramiento de Calidad (Constitución II)

### Decision
- **Pruebas de Dominio y Contrato (TDD)**: Pruebas unitarias de la lógica de recetas (cálculo de tiempo total, filtrado de alérgenos, parseo de ingredientes) ejecutadas con Vitest.
- **Pruebas de Contrato de API**: Validación de esquemas del cliente de imágenes mediante MSW (*Mock Service Worker*) simulando respuestas válidas, respuestas 404/vacías y latencia de red.
- **Pruebas de Componentes UI**: Pruebas con React Testing Library verificando renderizado de alérgenos, estados de carga y fallbacks.

### Rationale
- Satisface el principio no negociable de **Test-First Quality Assurance (TDD)** de la constitución.
- Garantiza que cualquier fallo externo de la API de imágenes sea tolerado sin romper la aplicación.
