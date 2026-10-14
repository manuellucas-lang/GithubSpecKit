import React from 'react';
import { Recipe } from '@shared/models/recipe';
import { AllergenBadge } from './AllergenBadge';
import { CookingTimeBadge } from './CookingTimeBadge';
import { useRecipeImagePreference } from '../hooks/useRecipeImagePreference';
import { Users, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  const { imageUrl, altDescription, isLoading } = useRecipeImagePreference(recipe.id, recipe.keyword);

  return (
    <article
      onClick={() => onSelect(recipe)}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = 'var(--border-color-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(recipe);
        }
      }}
      aria-label={`Ver receta de ${recipe.title}`}
    >
      {/* Visual Header Image Container */}
      <div style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-surface-elevated)' }}>
        {isLoading ? (
          <div
            className="animate-pulse"
            style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-surface-elevated)' }}
          />
        ) : (
          <img
            src={imageUrl}
            alt={altDescription || recipe.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            loading="lazy"
          />
        )}

        {/* Floating Time Badge */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <CookingTimeBadge cookingTime={recipe.cookingTime} variant="compact" />
        </div>

        {/* Floating Difficulty Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            color: 'var(--text-main)',
            padding: '3px 9px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <ChefHat size={12} color="var(--color-primary)" />
          {recipe.difficulty}
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '14px' }}>
        <div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.3,
              marginBottom: '6px',
            }}
          >
            {recipe.title}
          </h3>
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {recipe.description}
          </p>
        </div>

        {/* Servings meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <Users size={14} />
          <span>{recipe.servings} raciones</span>
        </div>

        {/* Allergens badges container */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {recipe.allergens.length === 0 ? (
            <AllergenBadge isSafeBadge />
          ) : (
            recipe.allergens.slice(0, 3).map(code => (
              <AllergenBadge key={code} allergen={code} />
            ))
          )}
          {recipe.allergens.length > 3 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
              +{recipe.allergens.length - 3} mas
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
