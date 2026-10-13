# Contract: Recipe Service Interface

**Feature**: `001-recipe-catalog`  
**Artifact**: `contracts/recipe-service.contract.md`  
**Protocol / Pattern**: TypeScript Interface & In-Memory / REST Repository Contract  

---

## 1. Overview
Define el contrato de servicio público para consultar el catálogo de recetas, obtener detalles de recetas individuales y aplicar filtros por ingredientes o exclusión de alérgenos.

---

## 2. Definición de Tipos e Interfaces (TypeScript Specification)

```typescript
export type AllergenCode =
  | 'GLUTEN'
  | 'CRUSTACEANS'
  | 'EGGS'
  | 'FISH'
  | 'PEANUTS'
  | 'SOY'
  | 'DAIRY'
  | 'NUTS'
  | 'CELERY'
  | 'MUSTARD'
  | 'SESAME'
  | 'SULPHITES'
  | 'LUPIN'
  | 'MOLLUSCS';

export interface CookingTimeDTO {
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  displayLabel: string;
}

export interface IngredientDTO {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface RecipeStepDTO {
  stepNumber: number;
  title: string;
  instruction: string;
  estimatedMinutes?: number;
}

export interface RecipeImageDTO {
  keyword: string;
  imageUrl?: string;
  thumbUrl?: string;
  photographerName?: string;
  sourceUrl?: string;
  fetchStatus: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'FALLBACK';
}

export interface RecipeSummaryDTO {
  id: string;
  title: string;
  description: string;
  keyword: string;
  servings: number;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  cookingTime: CookingTimeDTO;
  allergens: AllergenCode[];
  image?: RecipeImageDTO;
}

export interface RecipeDetailDTO extends RecipeSummaryDTO {
  ingredients: IngredientDTO[];
  steps: RecipeStepDTO[];
}

export interface RecipeFilterOptions {
  searchQuery?: string;            // Búsqueda por título o ingrediente
  excludedAllergens?: AllergenCode[]; // Alérgenos a excluir de los resultados
  maxTotalMinutes?: number;        // Filtro por tiempo máximo de preparación+cocción
  difficulty?: 'Fácil' | 'Intermedio' | 'Avanzado';
}
```

---

## 3. Contrato del Servicio (`IRecipeService`)

```typescript
export interface IRecipeService {
  /**
   * Obtiene la lista de recetas filtrada por criterios de búsqueda y alérgenos.
   * @param filters Criterios opcionales de búsqueda y exclusión.
   * @returns Promesa con la lista resumida de recetas coincidentes.
   */
  getRecipes(filters?: RecipeFilterOptions): Promise<RecipeSummaryDTO[]>;

  /**
   * Recupera el detalle completo de una receta por su identificador.
   * @param id Identificador único de la receta.
   * @returns Promesa con los detalles de la receta o null si no se encuentra.
   */
  getRecipeById(id: string): Promise<RecipeDetailDTO | null>;

  /**
   * Retorna la lista estandarizada de alérgenos reconocidos por el sistema.
   */
  getAllergensCatalog(): AllergenCode[];
}
```

---

## 4. Ejemplos de Respuestas y Comportamiento Esperado

### 4.1. Respuesta exitosa: Consulta de catálogo
```json
[
  {
    "id": "rec-01-paella-marisco",
    "title": "Paella de Marisco Tradicional",
    "description": "Arroz mediterráneo con gambas, mejillones y azafrán.",
    "keyword": "seafood paella",
    "servings": 4,
    "difficulty": "Intermedio",
    "cookingTime": {
      "prepMinutes": 20,
      "cookMinutes": 25,
      "totalMinutes": 45,
      "displayLabel": "45 min"
    },
    "allergens": ["CRUSTACEANS", "MOLLUSCS", "FISH"]
  },
  {
    "id": "rec-02-gazpacho-andaluz",
    "title": "Gazpacho Andaluz Tradicional",
    "description": "Sopa fría refrescante de tomate, pepino y aceite de oliva virgen extra.",
    "keyword": "gazpacho",
    "servings": 6,
    "difficulty": "Fácil",
    "cookingTime": {
      "prepMinutes": 15,
      "cookMinutes": 0,
      "totalMinutes": 15,
      "displayLabel": "15 min (Sin cocción)"
    },
    "allergens": []
  }
]
```

### 4.2. Invariantes de Seguridad y Errores
- Si `getRecipeById` recibe un ID inexistente, debe resolver `null` de forma controlada sin lanzar excepciones no capturadas.
- Si el filtro `excludedAllergens` contiene `['CRUSTACEANS']`, la receta `rec-01-paella-marisco` queda excluida del listado.
- Si `allergens` es un array vacío, el cliente debe garantizar el renderizado del indicador de plato seguro.
