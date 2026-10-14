import { useState } from 'react';
import { ShoppingListItem } from '@shared/models/shopping_list';
import { ShoppingBag, Copy, Check, CheckSquare, Square, ChefHat } from 'lucide-react';

interface ShoppingListViewProps {
  items: ShoppingListItem[];
  onToggleItem: (itemKey: string) => void;
  onClearChecked: () => void;
  onCopyText: (text: string) => void;
  onNavigateToPlanner: () => void;
}

export const ShoppingListView = ({
  items,
  onToggleItem,
  onClearChecked,
  onCopyText,
  onNavigateToPlanner,
}: ShoppingListViewProps) => {
  const [copied, setCopied] = useState(false);

  const checkedCount = items.filter(i => i.checked).length;

  const handleCopy = () => {
    const lines = [
      'LISTA DE LA COMPRA - GOURMETCRAFT',
      '==================================',
      '',
    ];

    items.forEach(i => {
      const mark = i.checked ? '[x]' : '[ ]';
      lines.push(`${mark} ${i.name}: ${i.totalQuantity} ${i.unit} (Para: ${i.sourceRecipes.join(', ')})`);
    });

    onCopyText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '24px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={24} strokeWidth={2.4} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Lista de la Compra Inteligente
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Ingredientes consolidados y calculados a partir de las recetas de tu menu semanal.
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {checkedCount > 0 && (
              <button
                onClick={onClearChecked}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Desmarcar todos ({checkedCount})
              </button>
            )}

            <button
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: copied ? 'var(--color-success)' : 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Lista copiada' : 'Copiar lista al portapapeles'}
            </button>
          </div>
        )}
      </div>

      {/* Main List Container */}
      {items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ShoppingBag size={28} color="var(--color-success)" />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            Tu lista de la compra esta vacia
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 20px' }}>
            Asigna recetas a los dias de la semana en tu planificador para que generemos automaticamente los ingredientes requeridos.
          </p>
          <button
            onClick={onNavigateToPlanner}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Ir al Planificador Semanal
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}
        >
          {/* Progress bar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Progreso de compra: {checkedCount} de {items.length} productos ({Math.round((checkedCount / items.length) * 100)}%)
            </span>
          </div>

          <ul style={{ listStyle: 'none' }}>
            {items.map(item => (
              <li
                key={item.key}
                onClick={() => onToggleItem(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: item.checked ? 'rgba(15, 23, 42, 0.4)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <button
                    style={{
                      color: item.checked ? 'var(--color-success)' : 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    aria-label={`Marcar ${item.name} como comprado`}
                  >
                    {item.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>

                  <div>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: item.checked ? 'var(--text-dim)' : 'var(--text-main)',
                        textDecoration: item.checked ? 'line-through' : 'none',
                      }}
                    >
                      {item.name}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      <ChefHat size={12} />
                      <span>Para: {item.sourceRecipes.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: item.checked ? 'var(--text-dim)' : 'var(--color-primary)',
                    textDecoration: item.checked ? 'line-through' : 'none',
                  }}
                >
                  {item.totalQuantity} {item.unit}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
