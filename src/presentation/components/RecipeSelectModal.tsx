import { useState } from 'react';
import { Recipe } from '../../domain/models/recipe';
import { X, Search, Clock, Plus } from 'lucide-react';

interface RecipeSelectModalProps {
  recipes: Recipe[];
  dayLabel: string;
  slotLabel: string;
  onSelect: (recipe: Recipe) => void;
  onClose: () => void;
}

export const RecipeSelectModal = ({
  recipes,
  dayLabel,
  slotLabel,
  onSelect,
  onClose,
}: RecipeSelectModalProps) => {
  const [search, setSearch] = useState('');

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase().trim()) ||
    r.ingredients.some(i => i.name.toLowerCase().includes(search.toLowerCase().trim()))
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Seleccionar receta para ${dayLabel} - ${slotLabel}`}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        className="animate-fade-in"
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Asignar Receta
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              {dayLabel} - {slotLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
            aria-label="Cerrar ventana modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar receta por nombre o ingrediente..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Recipes list */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '32px 0' }}>
              No se encontraron recetas coincidentes
            </p>
          ) : (
            filtered.map(recipe => (
              <div
                key={recipe.id}
                onClick={() => onSelect(recipe)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {recipe.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {recipe.cookingTime.displayLabel}
                    </span>
                    <span>{recipe.difficulty}</span>
                    <span>{recipe.ingredients.length} ingredientes</span>
                  </div>
                </div>

                <button
                  style={{
                    backgroundColor: 'rgba(234, 88, 12, 0.15)',
                    color: 'var(--color-primary)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Elegir
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
