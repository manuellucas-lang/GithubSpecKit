# Quickstart & Verification Guide: Selección de Imagen Alternativa mediante Carrusel

**Feature**: `002-load-image`  
**Date**: 2026-10-14  

---

## 1. Requisitos Previos y Entorno

- Node.js versión 20 o superior.
- Dependencias del proyecto instaladas (`npm ci` o `npm install`).
- Servidor de desarrollo Vite activo (`npm run dev`) o entorno de pruebas Vitest.

---

## 2. Pruebas Automatizadas

### 2.1. Pruebas Unitarias de Persistencia de Preferencias
Valida la creación, lectura, actualización, eliminación y sincronización por eventos del servicio `RecipeImagePreferenceService`.
```bash
npm run test -- src/tests/unit/recipe_image_preference_service.test.ts
```

### 2.2. Pruebas de Contrato de Múltiples Candidatos (MSW)
Verifica que `ImageProviderClient.fetchImageCandidatesByKeyword` responde con candidatos válidos ante peticiones exitosas, respuestas parciales y errores de red o cuota excedida (fallback).
```bash
npm run test -- src/tests/contract/image_candidates_provider.test.ts
```

### 2.3. Pruebas de Componentes del Carrusel Modal
Valida el ciclo de vida del modal: apertura, navegación de carrusel con flechas, selección de imagen, llamada a callbacks de cierre y restauración de imagen por defecto.
```bash
npm run test -- src/tests/components/RecipeImageCarouselModal.test.tsx
```

### 2.4. Ejecución de la Suite Completa y Verificación de Tipos
```bash
npm run test && npm run typecheck
```

---

## 3. Escenarios de Verificación Manual (E2E)

### Escenario 1: Apertura del Carrusel desde la Ficha de Detalle
1. Iniciar la aplicación y navegar al catálogo principal (`http://localhost:5173`).
2. Abrir el detalle de una receta (por ejemplo, "Paella de Marisco").
3. Observar la indicación interactiva sobre la imagen principal (icono de cámara o botón "Cambiar imagen").
4. Hacer clic sobre la imagen principal.
5. **Resultado esperado**: Se abre el diálogo modal con el carrusel y se muestran al menos 4 candidatos fotográficos representativos de la receta.

### Escenario 2: Selección y Propagación de Imagen Alternativa
1. Con el carrusel abierto, usar las flechas o desplazamiento para revisar las opciones disponibles.
2. Hacer clic en una imagen alternativa diferente a la actual.
3. **Resultado esperado**:
   - El carrusel se cierra.
   - La pantalla de detalle muestra inmediatamente la nueva imagen seleccionada y su correspondiente crédito de fotógrafo.
   - Al pulsar "Volver al catálogo", la tarjeta de "Paella de Marisco" exhibe la nueva imagen seleccionada.

### Escenario 3: Persistencia entre Recargas
1. Tras seleccionar una imagen personalizada, recargar la página en el navegador (`F5` o `Cmd+R`).
2. **Resultado esperado**: La imagen personalizada se mantiene intacta tanto en el catálogo como en la ficha de detalle.

### Escenario 4: Restablecer Imagen Original por Defecto
1. Volver a abrir el detalle de la receta con imagen personalizada.
2. Hacer clic sobre la imagen para abrir el carrusel.
3. Pulsar el botón "Restablecer por defecto".
4. **Resultado esperado**: La receta vuelve inmediatamente a su imagen original predeterminada.

### Escenario 5: Cierre sin Modificaciones
1. Abrir el carrusel en cualquier receta.
2. Pulsar la tecla `Escape` o el botón de cierre con icono de cruz.
3. **Resultado esperado**: El diálogo se cierra sin alterar la imagen previa de la receta.
