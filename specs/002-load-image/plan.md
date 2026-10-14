# Implementation Plan: Selección de Imagen Alternativa para Recetas mediante Carrusel

**Branch**: `feature/002-load-image` | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-load-image/spec.md`

## Summary

Desarrollo de la capacidad de explorar y seleccionar imágenes alternativas para las recetas culinarias de la aplicación. Al hacer clic sobre la fotografía principal de una receta en la pantalla de detalle (`RecipeDetail.tsx`), se abre un diálogo modal accesible con un carrusel interactivo (`RecipeImageCarouselModal.tsx`) que solicita y exhibe múltiples imágenes candidatas obtenidas desde la API externa por palabra clave (*keyword*). El usuario puede navegar de forma táctil o mediante controles interactivos, seleccionar una nueva imagen representativa para el plato y persistir su preferencia en almacenamiento local (`localStorage`), propagando el cambio en tiempo real al catálogo general y al planificador semanal, con opción de restaurar la imagen por defecto y fallback ante fallos de red.

## Technical Context

**Language/Version**: TypeScript 5.x / ECMAScript 2024  
**Primary Dependencies**: React 19, React-DOM 19, Vite 6, Lucide React (iconografía culinaria, flechas de carrusel, cámara y controles), Tailwind CSS / Vanilla CSS tokens  
**Storage**: `localStorage` para persistencia reactiva de preferencias de imagen (`recipe_catalog_image_preferences`) y `sessionStorage` para caché de candidatos por palabra clave  
**Testing**: Vitest, React Testing Library, MSW (Mock Service Worker para pruebas de contrato de candidatos)  
**Target Platform**: Navegadores web modernos (Desktop, Tablet, Mobile)  
**Project Type**: Single Page Web Application (SPA) con arquitectura modular (*Library-First*)  
**Performance Goals**: < 300 ms tiempo de apertura de carrusel modal, < 150 ms propagación de imagen seleccionada, 60 fps en transiciones de scroll-snap  
**Constraints**: Resiliencia total ante contingencias de red o límite de cuota (fallback a colección vectorial SVG), conformidad estricta con la normativa de cero emojis, soporte táctil fluido en pantallas móviles desde 360px  
**Scale/Scope**: Selector de imagen alternativo mediante carrusel, servicio de preferencias de imagen y sincronización reactiva en componentes de catálogo, detalle y planificador  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principio I (Spec-First & Library-First Architecture)**: **APROBADO**. Se formalizaron especificación ([spec.md](spec.md)), modelo de datos ([data-model.md](data-model.md)) y contratos de interfaz desacoplados ([contracts/image-selection.contract.md](contracts/image-selection.contract.md)) previo a la implementación.
- **Principio II (Test-First Quality Assurance - TDD Mandatorio)**: **APROBADO**. Se definen suites de pruebas previas a la implementación: pruebas unitarias del servicio de preferencias en `localStorage`, pruebas de contrato de múltiples candidatos con MSW y pruebas de componentes para el carrusel modal.
- **Principio III (CLI-First & Text Protocol Interfaces)**: **APROBADO**. Modelo de datos serializable en JSON estándar para persistencia e intercambio.
- **Principio IV (Continuous Integration & Observability)**: **APROBADO**. Verificación estricta de tipos (`npm run typecheck`), suite automatizada de pruebas (`npm run test`) y estados observables en el carrusel (`CLOSED`, `LOADING_CANDIDATES`, `READY`, `APPLYING_SELECTION`, `ERROR_FALLBACK`).
- **Principio V (Simplicity & YAGNI Principle)**: **APROBADO**. Carrusel implementado con CSS Scroll Snap nativo de alto rendimiento en lugar de pesadas dependencias de terceros; almacenamiento ligero en `localStorage`.

## Project Structure

### Documentation (this feature)

```text
specs/002-load-image/
├── spec.md              # Especificación funcional validada
├── plan.md              # Este plan de implementación técnica
├── research.md          # Decisiones de arquitectura y alternativas evaluadas (Fase 0)
├── data-model.md        # Modelo de datos, entidades y diagrama de estados (Fase 1)
├── quickstart.md        # Guía de verificación y ejecución (Fase 1)
├── checklists/
│   └── requirements.md  # Checklist de calidad de requisitos
└── contracts/
    └── image-selection.contract.md # Contratos TypeScript para proveedor y preferencias (Fase 1)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── models/
│   │   ├── recipe_image_preference.ts   # Modelo y tipos de preferencia personalizada de imagen
│   │   └── recipe_image_candidate.ts    # Modelo de candidato fotográfico del carrusel
│   └── services/
│       └── recipe_image_preference_service.ts # Servicio de gestión de preferencias y almacenamiento local
├── infrastructure/
│   └── api/
│       └── image_provider_client.ts     # Extensión con fetchImageCandidatesByKeyword y fallback
├── presentation/
│   ├── components/
│   │   ├── RecipeImageCarouselModal.tsx # Diálogo modal accesible con carrusel CSS Scroll Snap
│   │   ├── RecipeDetail.tsx             # Apertura del carrusel al pulsar la imagen principal
│   │   ├── RecipeCard.tsx               # Reflejo reactivo de la imagen personalizada
│   │   └── WeeklyPlanner.tsx            # Visualización consistente de imágenes en el menú
│   └── hooks/
│       └── useRecipeImagePreference.ts  # Hook para consumir y actualizar la imagen activa de una receta
└── tests/
    ├── unit/
    │   └── recipe_image_preference_service.test.ts # Pruebas unitarias de persistencia y eventos
    ├── contract/
    │   └── image_candidates_provider.test.ts       # Pruebas de contrato de candidatos con MSW
    └── components/
        └── RecipeImageCarouselModal.test.tsx       # Pruebas de integración del modal y carrusel
```

**Structure Decision**: Se mantiene la arquitectura modular limpia y desacoplada del proyecto. El servicio de preferencias gestiona el almacenamiento local y despacha eventos de cambio, permitiendo a los componentes existentes de React 19 reaccionar instantáneamente sin acoplamientos innecesarios.

## Complexity Tracking

*No hay violaciones constitucionales que requieran justificación excepcional. La implementación mediante CSS Scroll Snap nativo se alinea rigurosamente con el principio de mínima complejidad viable (YAGNI).*
