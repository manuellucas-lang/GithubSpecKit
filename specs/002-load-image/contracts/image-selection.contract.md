# Interface Contract: Selección y Proveedor de Candidatos de Imagen

**Feature**: `002-load-image`  
**Contract Type**: TypeScript Interfaces & Component Contracts  
**Status**: Approved  

---

## 1. Contrato del Proveedor de Candidatos de Imagen (`IImageCandidateProvider`)

Define el método para obtener múltiples opciones fotográficas por término gastronómico.

```typescript
export interface ImageCandidatesQueryOptions {
  keyword: string;
  count?: number; // Cantidad deseada de candidatos (por defecto 6, mín 3, máx 10)
  orientation?: 'landscape' | 'squarish';
}

export interface IImageCandidateProvider {
  /**
   * Obtiene una colección de candidatos fotográficos para una palabra clave.
   * En caso de error de red o cuota excedida, debe resolver con imágenes de fallback temáticas
   * garantizando que nunca rechaza la promesa con un error no controlado.
   */
  fetchImageCandidatesByKeyword(options: ImageCandidatesQueryOptions): Promise<RecipeImageCandidate[]>;
}
```

---

## 2. Contrato del Servicio de Preferencias de Imagen (`IRecipeImagePreferenceService`)

Gestiona la persistencia en `localStorage` y la sincronización reactiva de las imágenes personalizadas de cada receta.

```typescript
export interface ImagePreferenceChangeEvent {
  recipeId: string;
  preference: RecipeImagePreference | null; // null si fue restablecida por defecto
}

export interface IRecipeImagePreferenceService {
  /**
   * Recupera la preferencia personalizada de una receta, o null si usa la imagen por defecto.
   */
  getPreference(recipeId: string): RecipeImagePreference | null;

  /**
   * Guarda una nueva imagen seleccionada para la receta y despacha el evento de sincronización.
   * Devuelve true si la persistencia fue exitosa, o false si falló el almacenamiento.
   */
  setPreference(recipeId: string, candidate: RecipeImageCandidate): boolean;

  /**
   * Elimina la personalización de la receta para restablecer la imagen inicial por defecto.
   * Devuelve true si la eliminación fue exitosa, o false si falló el almacenamiento.
   */
  clearPreference(recipeId: string): boolean;

  /**
   * Obtiene todas las personalizaciones almacenadas indexadas por recipeId.
   */
  getAllPreferences(): Record<string, RecipeImagePreference>;

  /**
   * Suscribe un callback a cambios de preferencias para actualización reactiva entre componentes.
   */
  subscribe(callback: (event: ImagePreferenceChangeEvent) => void): () => void;
}
```

---

## 3. Contrato del Componente de Interfaz (`RecipeImageCarouselModalProps`)

Define las propiedades del diálogo modal que alberga el carrusel de selección.

```typescript
export interface RecipeImageCarouselModalProps {
  isOpen: boolean;
  recipeId: string;
  recipeTitle: string;
  keyword: string;
  currentImageUrl?: string;
  onSelectImage: (candidate: RecipeImageCandidate) => boolean;
  onResetDefault: () => void;
  onClose: () => void;
}
```
