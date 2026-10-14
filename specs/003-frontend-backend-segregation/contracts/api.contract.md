# REST API Contracts: Backend & Frontend Segregation

**Contract Version**: `1.0.0`  
**Base Path**: `/api/v1`  
**Format**: JSON (`Content-Type: application/json; charset=utf-8`)

---

## 1. Endpoints Overview

| Método | Ruta | Descripción | Payload Request | Respuesta Éxito |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Diagnóstico de salud del servicio | Ninguno | `200 OK`: `HealthStatusDto` |
| `GET` | `/recipes` | Listado de recetas con filtros | Query Params | `200 OK`: `RecipeListResponseDto` |
| `GET` | `/recipes/:id` | Detalle de una receta por identificador | Ninguno | `200 OK`: `RecipeDto` / `404 Not Found` |
| `GET` | `/images/candidates` | Búsqueda de imágenes candidatas seguras | Query Params | `200 OK`: `RecipeImageCandidateDto[]` |
| `GET` | `/preferences` | Listado de todas las preferencias de imagen | Ninguno | `200 OK`: `Record<string, RecipeImagePreferenceDto>` |
| `GET` | `/preferences/:recipeId` | Preferencia de imagen de una receta | Ninguno | `200 OK`: `RecipeImagePreferenceDto` / `404` |
| `PUT` | `/preferences/:recipeId` | Guardar preferencia de imagen personalizada | `SavePreferenceRequestDto` | `200 OK`: `RecipeImagePreferenceDto` |
| `DELETE`| `/preferences/:recipeId` | Restablecer a imagen por defecto | Ninguno | `200 OK`: `{ success: true }` |
| `GET` | `/planner` | Obtener asignaciones del planificador semanal | Ninguno | `200 OK`: `WeeklyPlanDto` |
| `PUT` | `/planner` | Actualizar plan semanal completo | `WeeklyPlanDto` | `200 OK`: `WeeklyPlanDto` |
| `GET` | `/shopping-list` | Obtener lista de compras agregada del plan | Ninguno | `200 OK`: `ShoppingListDto` |

---

## 2. TypeScript Data Transfer Objects (DTOs)

```typescript
// shared/dto/recipe.dto.ts

export interface RecipeDto {
  id: string;
  name: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  cuisine: string;
  tags: string[];
  allergens: string[];
  imageUrl: string;
  ingredients: RecipeIngredientDto[];
  instructions: string[];
}

export interface RecipeIngredientDto {
  name: string;
  amount: number;
  unit: string;
  category: string;
}

export interface RecipeFilterQueryDto {
  search?: string;
  maxCookingMinutes?: number;
  difficulty?: string;
  cuisine?: string;
  tag?: string;
}

export interface RecipeListResponseDto {
  data: RecipeDto[];
  total: number;
}
```

```typescript
// shared/dto/image.dto.ts

export interface ImageCandidatesQueryDto {
  keyword: string;
  count?: number;
}

export interface RecipeImageCandidateDto {
  id: string;
  keyword: string;
  url: string;
  thumbUrl: string;
  altDescription: string;
  photographerName: string;
  photographerUrl?: string;
  isFallback: boolean;
}

export interface RecipeImagePreferenceDto {
  recipeId: string;
  imageId: string;
  url: string;
  thumbUrl: string;
  altDescription: string;
  photographerName: string;
  photographerUrl?: string;
  isCustom: boolean;
  updatedAt: string;
}

export interface SavePreferenceRequestDto {
  candidate: RecipeImageCandidateDto;
}
```

```typescript
// shared/dto/planner.dto.ts

export type MealType = 'lunch' | 'dinner';
export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface PlannedMealDto {
  recipeId: string;
  servings: number;
}

export interface WeeklyPlanDto {
  weekId: string;
  days: Record<DayOfWeek, {
    lunch: PlannedMealDto | null;
    dinner: PlannedMealDto | null;
  }>;
  updatedAt: string;
}

export interface ShoppingListItemDto {
  key: string;
  name: string;
  totalQuantity: number;
  unit: string;
  sourceRecipes: string[];
  checked: boolean;
}

export interface ShoppingListDto {
  items: ShoppingListItemDto[];
  generatedAt: string;
}
```

---

## 3. Error Contract (RFC 7807 Format)

Toda respuesta con código HTTP 4xx o 5xx sigue la estructura estandarizada:

```typescript
// shared/dto/error.dto.ts

export interface ApiErrorResponseDto {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  invalidParams?: Array<{
    name: string;
    reason: string;
  }>;
}
```
