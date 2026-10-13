import React from 'react';
import { CookingTime } from '../../domain/models/cooking_time';
import { Clock, Flame } from 'lucide-react';

interface CookingTimeBadgeProps {
  cookingTime: CookingTime;
  variant?: 'compact' | 'detailed';
}

export const CookingTimeBadge: React.FC<CookingTimeBadgeProps> = ({
  cookingTime,
  variant = 'compact',
}) => {
  if (variant === 'compact') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(234, 88, 12, 0.12)',
          color: 'var(--color-primary)',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
        title={`Tiempo total: ${cookingTime.displayLabel}`}
      >
        <Clock size={13} strokeWidth={2.5} />
        {cookingTime.displayLabel}
      </span>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 18px',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={18} color="var(--color-primary)" />
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Preparación
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{cookingTime.prepMinutes} min</div>
        </div>
      </div>

      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Flame size={18} color="var(--color-primary)" />
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cocción
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            {cookingTime.cookMinutes > 0 ? `${cookingTime.cookMinutes} min` : '0 min (Frío)'}
          </div>
        </div>
      </div>

      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Tiempo Total
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)' }}>
          {cookingTime.displayLabel}
        </div>
      </div>
    </div>
  );
};
