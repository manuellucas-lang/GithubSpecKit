# Implementation Plan: Catálogo Profesional de Recetas con React 19

**Branch**: `001-recipe-catalog` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-recipe-catalog/spec.md`

## Summary

Desarrollo de un catálogo web profesional de recetas culinarias con React 19, complementado con un planificador de comidas semanal (7 días, 2 turnos por día) y un generador inteligente de lista de la compra consolidada. El sistema permite explorar recetas, consultar listas de ingredientes detalladas con cantidades, tiempos de cocción desglosados (preparación vs. cocción) y avisos normalizados de alérgenos (normativa de 14 alérgenos UE). La aplicación incorpora una capa visual premium con microinteracciones y carga dinámica de imágenes fotográficas por palabra clave (*keyword*) consumiendo un servicio externo con mecanismos de respaldo (*fallback*) y pantallas de carga esqueléticas (*skeleton loaders*).

## Technical Context

**Language/Version**: TypeScript 5.x / ECMAScript 2024  
**Primary Dependencies**: React 19, React-DOM 19, Vite 6, Lucide React (iconografía culinaria/alérgenos), Tailwind CSS / Vanilla CSS tokens  
**Storage**: Catálogo estructurado en memoria / SessionStorage para caché de imágenes / LocalStorage para persistencia reactiva del plan semanal y compras  
**Testing**: Vitest, React Testing Library, MSW (Mock Service Worker para pruebas de contrato de API)  
**Target Platform**: Navegadores web modernos (Desktop, Tablet, Mobile)  
**Project Type**: Single Page Web Application (SPA) con arquitectura modular (*Library-First*)  
**Performance Goals**: < 1.5s tiempo de renderizado inicial, < 200ms cálculo de consolidación de compras, 60fps en animaciones y transiciones de UI  
**Constraints**: Resiliencia total ante caídas o cuotas de la API de imágenes (fallback transparente sin romper la UI), conformidad estricta con los 14 alérgenos de declaración obligatoria, consolidación aritmética precisa de ingredientes  
**Scale/Scope**: Catálogo de recetas, organizador semanal y gestor de compras interactivo  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principio I (Spec-First & Library-First Architecture)**: **APROBADO**. Se diseñaron especificaciones formales ([spec.md](spec.md)), modelo de datos ([data-model.md](data-model.md)) y contratos de interfaz desacoplados ([contracts/recipe-service.contract.md](contracts/recipe-service.contract.md), [contracts/image-provider.contract.md](contracts/image-provider.contract.md), [contracts/planner-and-shopping.contract.md](contracts/planner-and-shopping.contract.md)).
- **Principio II (Test-First Quality Assurance - TDD Mandatorio)**: **APROBADO**. Se definen suites de pruebas previas a la implementación: pruebas unitarias de cálculo de tiempos, pruebas de filtrado de alérgenos, pruebas del algoritmo de consolidación de la compra y contratos simulados con MSW.
- **Principio III (CLI-First & Text Protocol Interfaces)**: **APROBADO**. El servicio y los adaptadores se basan en DTOs y serialización JSON pura estándar.
- **Principio IV (Continuous Integration & Observability)**: **APROBADO**. Se incluyen puertas de verificación de tipos (`typecheck`), pruebas automatizadas y diagnóstico de estados de carga de imagen (`IDLE`, `LOADING`, `SUCCESS`, `ERROR`, `FALLBACK`).
- **Principio V (Simplicity & YAGNI Principle)**: **APROBADO**. Arquitectura SPA directa con React 19 y Vite; persistencia ligera en `localStorage` sin base de datos pesada.

## Project Structure

### Documentation (this feature)

```text
specs/001-recipe-catalog/
├── spec.md              # Especificación funcional validada
├── plan.md              # Este documento de planificación técnica
├── research.md          # Decisiones técnicas y análisis de alternativas
├── data-model.md        # Diagrama entidad-relación y modelo de datos
├── quickstart.md        # Guía de verificación y ejecución
├── checklists/
│   └── requirements.md  # Checklist de calidad de requisitos
└── contracts/
    ├── recipe-service.contract.md        # Contrato público del servicio de recetas
    ├── image-provider.contract.md        # Contrato de la API de imágenes por keyword
    └── planner-and-shopping.contract.md  # Contrato de planificador y lista de la compra
```

### Source Code (repository root)

```text
src/
├── domain/                      # Lógica de negocio y modelos de datos puros (Library-First)
│   ├── models/                  # Tipos: Recipe, Ingredient, Allergen, CookingTime, Planner, ShoppingList
│   └── services/                # Filtros, validaciones, algoritmo de consolidación
├── infrastructure/              # Adaptadores de comunicación y persistencia
│   ├── api/                     # Cliente de imagen por keyword (Unsplash/Pexels API)
│   ├── cache/                   # Gestor de caché local para términos de búsqueda
│   ├── storage/                 # Gestor de persistencia localStorage para el plan semanal
│   ├── data/                    # Semilla de datos de recetas iniciales
│   └── services/                # Implementación de RecipeService, PlannerService y ShoppingListService
├── presentation/                # Componentes React 19 y diseño visual profesional
│   ├── components/
│   │   ├── RecipeCard.tsx       # Tarjeta con imagen, badges y tiempos
│   │   ├── RecipeDetail.tsx     # Ficha completa con ingredientes y pasos
│   │   ├── AllergenBadge.tsx    # Distintivo visual y accesible de alérgenos
│   │   ├── CookingTimeBadge.tsx # Indicador visual de tiempo de preparación/cocción
│   │   ├── SkeletonCard.tsx     # Esqueleto de carga visual
│   │   ├── SearchFilters.tsx    # Barra de búsqueda y exclusión de alérgenos
│   │   ├── WeeklyPlanner.tsx    # Planificador visual de 7 días x 2 turnos
│   │   ├── ShoppingListView.tsx # Lista de la compra interactiva consolidada
│   │   └── RecipeSelectModal.tsx # Selector modal de recetas para asignar a un turno
│   ├── hooks/                   # useRecipes, useRecipeImage, useWeeklyPlanner
│   └── App.tsx                  # Ensamblado principal de la aplicación con pestañas/vistas
└── tests/
    ├── unit/                    # Pruebas unitarias de dominio (TDD y consolidación)
    ├── contract/                # Pruebas de contrato de API de imágenes (MSW)
    └── components/              # Pruebas de renderizado, planificador y lista de compra
```

**Structure Decision**: Se mantiene la arquitectura modular limpia orientada al frontend (dominio desacoplado, infraestructura y presentación). La consolidación aritmética de la lista de la compra se encapsula en una función pura de dominio testeable unitariamente.

## Complexity Tracking

*No hay violaciones constitucionales que requieran justificación excepcional. La arquitectura propuesta cumple con el principio de mínima complejidad viable (YAGNI).*
