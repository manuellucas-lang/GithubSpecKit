import React from 'react';
import { AllergenCode, ALLERGENS_METADATA } from '@shared/models/allergen';
import { Search, Filter, X, Clock } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  excludedAllergens: AllergenCode[];
  onToggleExcludeAllergen: (code: AllergenCode) => void;
  maxTotalMinutes?: number;
  onMaxTotalMinutesChange: (mins?: number) => void;
  onClearFilters: () => void;
  totalResultsCount: number;
}

const COMMON_ALLERGENS_FILTER: AllergenCode[] = [
  'GLUTEN',
  'CRUSTACEANS',
  'EGGS',
  'FISH',
  'PEANUTS',
  'SOY',
  'DAIRY',
  'NUTS',
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  excludedAllergens,
  onToggleExcludeAllergen,
  maxTotalMinutes,
  onMaxTotalMinutesChange,
  onClearFilters,
  totalResultsCount,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    excludedAllergens.length > 0 ||
    typeof maxTotalMinutes === 'number';

  return (
    <section
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-md)',
      }}
      aria-label="Filtros de busqueda de recetas"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Search Bar Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar recetas por nombre o ingredientes (ej. arroz, salmon, chocolate)..."
            style={{
              width: '100%',
              padding: '14px 16px 14px 46px',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            aria-label="Buscar recetas"
          />
        </div>

        {/* Filters Row: Allergen Exclusions & Max Time */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              <Filter size={15} />
              <span>Excluir Alergenos (Seguridad Dietetica):</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  color: 'var(--color-danger)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
                Limpiar todos los filtros
              </button>
            )}
          </div>

          {/* Allergen Toggle Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {COMMON_ALLERGENS_FILTER.map(code => {
              const meta = ALLERGENS_METADATA[code];
              const isExcluded = excludedAllergens.includes(code);

              return (
                <button
                  key={code}
                  onClick={() => onToggleExcludeAllergen(code)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    backgroundColor: isExcluded ? 'var(--color-danger-bg)' : 'var(--bg-surface-elevated)',
                    color: isExcluded ? 'var(--color-danger)' : 'var(--text-muted)',
                    border: `1px solid ${isExcluded ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-color)'}`,
                  }}
                  aria-pressed={isExcluded}
                >
                  {isExcluded ? `Sin ${meta.name}` : `Excluir ${meta.name}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Max Cooking Time Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            <Clock size={14} />
            <span>Tiempo maximo:</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'Todos', value: undefined },
              { label: 'Hasta 20 min', value: 20 },
              { label: 'Hasta 30 min', value: 30 },
              { label: 'Hasta 45 min', value: 45 },
            ].map(opt => {
              const isSelected = maxTotalMinutes === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => onMaxTotalMinutesChange(opt.value)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: isSelected ? 'rgba(234, 88, 12, 0.2)' : 'var(--bg-app)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            Mostrando <strong>{totalResultsCount}</strong> {totalResultsCount === 1 ? 'receta' : 'recetas'}
          </div>
        </div>
      </div>
    </section>
  );
};
