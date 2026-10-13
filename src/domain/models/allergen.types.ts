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

export interface AllergenMeta {
  code: AllergenCode;
  name: string;
  colorCode: string;
  severity: 'WARNING' | 'ALERT';
}

export const ALLERGENS_METADATA: Record<AllergenCode, AllergenMeta> = {
  GLUTEN: { code: 'GLUTEN', name: 'Gluten', colorCode: '#e5a93c', severity: 'WARNING' },
  CRUSTACEANS: { code: 'CRUSTACEANS', name: 'Crustáceos', colorCode: '#e05d44', severity: 'WARNING' },
  EGGS: { code: 'EGGS', name: 'Huevos', colorCode: '#f4c430', severity: 'WARNING' },
  FISH: { code: 'FISH', name: 'Pescado', colorCode: '#3b82f6', severity: 'WARNING' },
  PEANUTS: { code: 'PEANUTS', name: 'Cacahuetes', colorCode: '#b45309', severity: 'WARNING' },
  SOY: { code: 'SOY', name: 'Soja', colorCode: '#10b981', severity: 'WARNING' },
  DAIRY: { code: 'DAIRY', name: 'Lácteos', colorCode: '#60a5fa', severity: 'WARNING' },
  NUTS: { code: 'NUTS', name: 'Frutos de Cáscara', colorCode: '#78350f', severity: 'WARNING' },
  CELERY: { code: 'CELERY', name: 'Apio', colorCode: '#84cc16', severity: 'WARNING' },
  MUSTARD: { code: 'MUSTARD', name: 'Mostaza', colorCode: '#d97706', severity: 'WARNING' },
  SESAME: { code: 'SESAME', name: 'Sésamo', colorCode: '#94a3b8', severity: 'WARNING' },
  SULPHITES: { code: 'SULPHITES', name: 'Sulfitos', colorCode: '#8b5cf6', severity: 'WARNING' },
  LUPIN: { code: 'LUPIN', name: 'Altramuces', colorCode: '#fbbf24', severity: 'WARNING' },
  MOLLUSCS: { code: 'MOLLUSCS', name: 'Moluscos', colorCode: '#06b6d4', severity: 'WARNING' },
};
