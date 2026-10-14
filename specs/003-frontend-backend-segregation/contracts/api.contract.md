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
| `PUT` | `/planner/meal` | Asignar o vaciar una comida del plan semanal | `SaveDayMealRequestDto` | `200 OK`: `WeeklyPlanDto` |
| `DELETE`| `/planner` | Limpiar todas las asignaciones del planificador | Ninguno | `200 OK`: `WeeklyPlanDto` |
| `GET` | `/shopping-list` | Obtener lista de compras agregada del plan | Ninguno | `200 OK`: `ShoppingListDto` |
| `GET` | `/planner/shopping-list` | Alias para lista de compras del plan | Ninguno | `200 OK`: `ShoppingListDto` |

---

## 2. TypeScript Data Transfer Objects (DTOs)

```typescript
// shared/dto/recipe.dto.ts

export type RecipeDifficulty = 'Fácil' | 'Intermedio' | 'Avanzado';

export interface RecipeStepDto {
  stepNumber: number;
  title: string;
  instruction: string;
  estimatedMinutes?: number;
}

export interface RecipeIngredientDto {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface CookingTimeDto {
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  displayLabel: string;
}

export interface RecipeDto {
  id: string;
  title: string;
  description: string;
  keyword: string;
  servings: number;
  difficulty: RecipeDifficulty;
  cookingTime: CookingTimeDto;
  ingredients: RecipeIngredientDto[];
  steps: RecipeStepDto[];
  allergens: string[];
  imageUrl?: string;
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

export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export type MealSlot = 'lunch' | 'dinner';

export interface DayPlanDto {
  lunch: RecipeDto | null;
  dinner: RecipeDto | null;
}

export type WeeklyPlanDto = Record<DayOfWeek, DayPlanDto>;

export interface SaveDayMealRequestDto {
  day: DayOfWeek;
  slot: MealSlot;
  recipeId: string | null;
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

export interface HealthStatusDto {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  uptimeSeconds: number;
  timestamp: string;
}
```
