# Contract: Weekly Planner & Shopping List Interface

**Feature**: `001-recipe-catalog`  
**Artifact**: `contracts/planner-and-shopping.contract.md`  
**Protocol / Pattern**: TypeScript Domain Service & Persistence Contract  

---

## 1. Overview
Define los contratos de servicio para la gestión del planificador de comidas semanal (7 días, 2 turnos por día) y la generación y consolidación algorítmica de la lista de la compra.

---

## 2. Definición de Tipos (TypeScript Specification)

```typescript
import { Recipe, Ingredient } from '../../domain/models/recipe';

export type DayOfWeek =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export type MealSlot = 'lunch' | 'dinner';

export interface DayPlanDTO {
  lunch: Recipe | null;
  dinner: Recipe | null;
}

export type WeeklyPlanDTO = Record<DayOfWeek, DayPlanDTO>;

export interface ShoppingListItemDTO {
  key: string;              // Clave normalizada: `${name.toLowerCase().trim()}_${unit.toLowerCase().trim()}`
  name: string;             // Nombre original del ingrediente
  totalQuantity: number;    // Cantidad aritmética acumulada
  unit: string;             // Unidad homogénea
  sourceRecipes: string[];  // Lista de títulos de recetas de origen
  checked: boolean;         // Marcado como comprado
}
```

---

## 3. Contratos de Servicios

### 3.1. `IPlannerService`
```typescript
export interface IPlannerService {
  /**
   * Obtiene el plan semanal actual almacenado en persistencia.
   */
  getWeeklyPlan(): WeeklyPlanDTO;

  /**
   * Asigna una receta a un día y turno específico.
   */
  assignMeal(day: DayOfWeek, slot: MealSlot, recipe: Recipe): WeeklyPlanDTO;

  /**
   * Elimina la receta asignada a un día y turno.
   */
  removeMeal(day: DayOfWeek, slot: MealSlot): WeeklyPlanDTO;

  /**
   * Restablece el plan semanal vaciando todas las asignaciones.
   */
  clearPlan(): WeeklyPlanDTO;
}
```

### 3.2. `IShoppingListService`
```typescript
export interface IShoppingListService {
  /**
   * Genera y consolida la lista de la compra a partir del plan semanal.
   * Agrupa ingredientes por nombre y unidad, sumando cantidades numéricas.
   */
  generateShoppingList(plan: WeeklyPlanDTO, existingCheckedKeys?: string[]): ShoppingListItemDTO[];

  /**
   * Alterna el estado de comprado (checked) de un ítem de la lista.
   */
  toggleItemCheck(itemKey: string, checked: boolean): void;

  /**
   * Genera el texto formateado para copiar la lista al portapapeles.
   */
  formatAsPlainText(items: ShoppingListItemDTO[]): string;
}
```

---

## 4. Reglas de Consolidación y Ejemplos de Salida

### Entrada de Ejemplo
- Lunes Almuerzo: Paella (Arroz bomba: 400 g, Caldo: 1000 ml)
- Miércoles Cena: Risotto (Arroz Carnaroli: 300 g, Mantequilla: 50 g, Arroz bomba: 100 g)

### Salida Consolidada
```json
[
  {
    "key": "arroz bomba_g",
    "name": "Arroz bomba",
    "totalQuantity": 500,
    "unit": "g",
    "sourceRecipes": ["Paella de Marisco Mediterránea", "Risotto Cremoso de Setas"],
    "checked": false
  },
  {
    "key": "caldo de pescado de roca_ml",
    "name": "Caldo de pescado de roca",
    "totalQuantity": 1000,
    "unit": "ml",
    "sourceRecipes": ["Paella de Marisco Mediterránea"],
    "checked": false
  }
]
```
