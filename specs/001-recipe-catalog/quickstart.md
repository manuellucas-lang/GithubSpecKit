# Quickstart & Verification Guide: Catálogo de Recetas

**Feature**: `001-recipe-catalog`  
**Artifact**: `quickstart.md`  
**Purpose**: Guía de verificación ejecutable y escenarios de prueba de extremo a extremo  
**Date**: 2026-10-13  

---

## 1. Prerrequisitos de Entorno

- **Node.js**: v20.x o superior (LTS)
- **Gestor de paquetes**: `npm` v10+ o `pnpm` v9+
- **Navegador**: Cualquier navegador moderno con soporte para ES2023 (Chrome, Safari, Firefox, Edge)

---

## 2. Configuración y Puesta en Marcha (Workflow Documental)

### 2.1. Instalación de Dependencias del Ecosistema
```bash
# Dependencias base de la aplicación (React 19)
npm install react@^19.0.0 react-dom@^19.0.0 lucide-react clsx tailwind-merge

# Dependencias de desarrollo, tipado y pruebas
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom vitest @testing-library/react @testing-library/jest-dom msw
```

### 2.2. Ejecución de la Suite de Verificación (TDD Mandatorio)
```bash
# Ejecutar pruebas unitarias de dominio y cálculo de tiempos
npm run test:unit

# Ejecutar pruebas de contratos de API (MSW)
npm run test:contracts

# Ejecutar validación de tipos
npm run typecheck
```

---

## 3. Escenarios de Validación End-to-End

### Escenario 1: Consulta Completa de Ficha de Receta (P1)
1. **Objetivo**: Verificar que una receta seleccionada exhibe todos sus ingredientes, alérgenos y tiempos sin datos incompletos.
2. **Acción**:
   - Abrir el catálogo y seleccionar la receta `"Paella de Marisco Tradicional"`.
3. **Resultado Esperado**:
   - Tiempos visibles: Preparación (20 min), Cocción (25 min), Total (45 min).
   - Lista de ingredientes desglosada con cantidades (ej. "Arroz bomba: 400 g", "Gambas: 250 g").
   - Alérgenos claramente destacados con badges de advertencia: Crustáceos, Moluscos y Pescado.
   - Pasos numerados del 1 al N secuencialmente.

### Escenario 2: Carga Dinámica de Imagen por Keyword y Respaldo ante Fallo (P2)
1. **Objetivo**: Probar la resiliencia y el comportamiento del cliente de imágenes ante palabras clave válidas y contingencias.
2. **Acción A (Éxito)**:
   - Renderizar receta con `keyword: "seafood paella"`.
   - **Resultado**: La imagen se carga dinámicamente desde el endpoint de la API con skeleton loader previo y atribución visible del fotógrafo.
3. **Acción B (Fallo/Sin conexión)**:
   - Simular desconexión de red o límite de cuota (HTTP 429).
   - **Resultado**: El componente muestra inmediatamente la imagen gastronómica vectorial por defecto (`isFallback: true`) sin errores en consola ni interrupción del flujo culinario.

### Escenario 3: Filtrado Seguro por Alérgenos (P3)
1. **Objetivo**: Comprobar la seguridad alimentaria en el filtrado de recetas.
2. **Acción**:
   - Marcar el filtro de exclusión: `"Excluir Crustáceos"` y `"Excluir Gluten"`.
3. **Resultado Esperado**:
   - La lista del catálogo excluye instantáneamente `"Paella de Marisco Tradicional"`.
   - Se mantienen recetas como `"Gazpacho Andaluz Tradicional"`.
   - El mensaje del badge indica explícitamente `"Libre de alérgenos comunes declarados"`.

---

## 4. Referencias Cruzadas

- [Especificación de la Funcionalidad](spec.md)
- [Decisiones de Investigación y Arquitectura](research.md)
- [Modelo de Datos y Entidades](data-model.md)
- [Contrato del Servicio de Recetas](contracts/recipe-service.contract.md)
- [Contrato de la API de Imágenes](contracts/image-provider.contract.md)
