import React, { useState } from 'react';
import { Recipe } from '../../domain/models/recipe';
import { AllergenBadge } from './AllergenBadge';
import { CookingTimeBadge } from './CookingTimeBadge';
import { useRecipeImagePreference } from '../hooks/useRecipeImagePreference';
import { RecipeImageCarouselModal } from './RecipeImageCarouselModal';
import { ArrowLeft, Users, ChefHat, AlertTriangle, ShieldCheck, Camera, Sparkles } from 'lucide-react';

/**
 * Props for the RecipeDetail component.
 */
interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

/**
 * Detailed recipe view presenting full culinary specifications, ingredient lists,
 * allergen warnings, step-by-step instructions, and alternative imagery selection trigger.
 *
 * @param props - Component properties containing the recipe entity and return callback.
 * @returns The rendered detailed recipe view.
 */
export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {

  const {
    imageUrl,
    altDescription,
    photographerName,
    isLoading,
    selectCandidate,
    resetToDefault,
  } = useRecipeImagePreference(recipe.id, recipe.keyword);

  const [isCarouselOpen, setIsCarouselOpen] = useState<boolean>(false);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }} className="animate-fade-in">
      {/* Return Button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-primary)',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '20px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(234, 88, 12, 0.1)',
          transition: 'background-color var(--transition-fast)',
        }}
        aria-label="Volver al catálogo de recetas"
      >
        <ArrowLeft size={16} />
        Volver al catálogo
      </button>

      {/* Main Container */}
      <article
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Hero Image with Interactive Carousel Trigger */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsCarouselOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsCarouselOpen(true);
            }
          }}
          aria-label="Hacer clic para abrir la galería y cambiar la imagen de la receta"
          style={{
            position: 'relative',
            height: '380px',
            width: '100%',
            backgroundColor: 'var(--bg-surface-elevated)',
            cursor: 'pointer',
          }}
        >
          {isLoading ? (
            <div className="animate-pulse" style={{ width: '100%', height: '100%' }} />
          ) : (
            <img
              src={imageUrl}
              alt={altDescription || recipe.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Change Image Visual Badge */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(234, 88, 12, 0.4)',
              color: 'var(--text-main)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Sparkles size={14} color="var(--color-primary)" />
            <span>Cambiar imagen</span>
          </div>

          {/* Photo attribution */}
          {photographerName && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Camera size={12} />
              <span>Foto: {photographerName}</span>
            </div>
          )}
        </div>

        {/* Carousel Modal */}
        <RecipeImageCarouselModal
          isOpen={isCarouselOpen}
          recipeId={recipe.id}
          recipeTitle={recipe.title}
          keyword={recipe.keyword}
          currentImageUrl={imageUrl}
          onSelectImage={candidate => {
            selectCandidate(candidate);
            setIsCarouselOpen(false);
          }}
          onResetDefault={() => {
            resetToDefault();
            setIsCarouselOpen(false);
          }}
          onClose={() => setIsCarouselOpen(false)}
        />


        {/* Content Body */}
        <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Header Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(234, 88, 12, 0.15)',
                  color: 'var(--color-primary)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <ChefHat size={13} />
                Dificultad: {recipe.difficulty}
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-muted)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <Users size={13} />
                {recipe.servings} raciones
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '12px' }}>
              {recipe.title}
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {recipe.description}
            </p>
          </div>

          {/* Cooking Times Bar */}
          <div>
            <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 700 }}>
              Tiempos de Preparación y Cocción
            </h2>
            <CookingTimeBadge cookingTime={recipe.cookingTime} variant="detailed" />
          </div>

          {/* Allergens Notification Panel */}
          <div
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: recipe.allergens.length === 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              border: `1px solid ${recipe.allergens.length === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              {recipe.allergens.length === 0 ? (
                <>
                  <ShieldCheck size={20} color="var(--color-success)" />
                  <strong style={{ color: 'var(--color-success)', fontSize: '1rem' }}>
                    Información de Seguridad: Libre de Alérgenos Declarados
                  </strong>
                </>
              ) : (
                <>
                  <AlertTriangle size={20} color="var(--color-danger)" />
                  <strong style={{ color: 'var(--color-danger)', fontSize: '1rem' }}>
                    Atención: Esta receta contiene los siguientes alérgenos declarados
                  </strong>
                </>
              )}
            </div>

            {recipe.allergens.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                Este plato no contiene ninguno de los 14 alérgenos de declaración obligatoria según el reglamento europeo.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {recipe.allergens.map(code => (
                  <AllergenBadge key={code} allergen={code} />
                ))}
              </div>
            )}
          </div>

          {/* Grid: Ingredients & Preparation Steps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {/* Ingredients column */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' }}>
                Ingredientes ({recipe.ingredients.length})
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recipe.ingredients.map(ing => (
                  <li
                    key={ing.id}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.92rem',
                    }}
                  >
                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{ing.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                      {ing.quantity} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps column */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' }}>
                Instrucciones Paso a Paso
              </h2>
              <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recipe.steps.map(step => (
                  <li
                    key={step.stepNumber}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      padding: '14px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      {step.stepNumber}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {step.title}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {step.instruction}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
