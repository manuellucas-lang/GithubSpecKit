import React from 'react';
import { AllergenCode, ALLERGENS_METADATA } from '../../domain/models/allergen.types';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface AllergenBadgeProps {
  allergen?: AllergenCode;
  isSafeBadge?: boolean;
}

export const AllergenBadge: React.FC<AllergenBadgeProps> = ({ allergen, isSafeBadge }) => {
  if (isSafeBadge) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.01em',
        }}
        role="status"
        aria-label="Libre de alérgenos comunes declarados"
      >
        <ShieldCheck size={14} strokeWidth={2.4} />
        Libre de alérgenos declarados
      </span>
    );
  }

  if (!allergen) return null;

  const meta = ALLERGENS_METADATA[allergen] || {
    name: allergen,
    colorCode: '#94a3b8',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: `${meta.colorCode}20`,
        color: meta.colorCode,
        border: `1px solid ${meta.colorCode}40`,
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
      title={`Contiene: ${meta.name}`}
      role="note"
    >
      <AlertCircle size={12} strokeWidth={2.4} />
      {meta.name}
    </span>
  );
};
