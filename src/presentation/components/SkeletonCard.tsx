import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="animate-pulse"
      role="progressbar"
      aria-label="Cargando receta"
    >
      {/* Image Skeleton */}
      <div style={{ height: '210px', backgroundColor: 'var(--bg-surface-elevated)' }} />

      {/* Content Skeleton */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ height: '22px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', width: '70%' }} />
        <div style={{ height: '14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', width: '90%' }} />
        <div style={{ height: '14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', width: '60%' }} />

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <div style={{ height: '24px', width: '65px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)' }} />
          <div style={{ height: '24px', width: '85px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>
    </div>
  );
};
