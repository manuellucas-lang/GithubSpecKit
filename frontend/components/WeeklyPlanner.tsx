import { useState } from 'react';
import { WeeklyPlan, DayOfWeek, MealSlot, DAYS_OF_WEEK } from '@shared/models/weekly_plan';
import { Recipe } from '@shared/models/recipe';
import { RecipeSelectModal } from './RecipeSelectModal';
import { useRecipeImagePreference } from '../hooks/useRecipeImagePreference';
import { Calendar, Trash2, Plus, Clock, Utensils, Moon } from 'lucide-react';

interface WeeklyPlannerProps {
  plan: WeeklyPlan;
  recipes: Recipe[];
  onAssignMeal: (day: DayOfWeek, slot: MealSlot, recipe: Recipe) => void;
  onRemoveMeal: (day: DayOfWeek, slot: MealSlot) => void;
  onClearPlan: () => void;
  onOpenRecipeDetail: (recipe: Recipe) => void;
}

const PlannerMealItem = ({
  recipe,
  onOpenDetail,
  onRemove,
  removeAriaLabel,
}: {
  recipe: Recipe;
  onOpenDetail: () => void;
  onRemove: () => void;
  removeAriaLabel: string;
}) => {
  const { imageUrl, altDescription } = useRecipeImagePreference(recipe.id, recipe.keyword);
  return (
    <div
      style={{
        padding: '10px 12px',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={altDescription || recipe.title}
            style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <h4
          onClick={onOpenDetail}
          style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer', flexGrow: 1 }}
        >
          {recipe.title}
        </h4>
        <button
          onClick={onRemove}
          style={{ color: 'var(--text-dim)', padding: '2px', cursor: 'pointer' }}
          title="Quitar receta"
          aria-label={removeAriaLabel}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
        <Clock size={11} />
        <span>{recipe.cookingTime.displayLabel}</span>
      </div>
    </div>
  );
};

export const WeeklyPlanner = ({
  plan,
  recipes,
  onAssignMeal,
  onRemoveMeal,
  onClearPlan,
  onOpenRecipeDetail,
}: WeeklyPlannerProps) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    day?: DayOfWeek;
    slot?: MealSlot;
    dayLabel?: string;
    slotLabel?: string;
  }>({ isOpen: false });

  const handleOpenAssignModal = (day: DayOfWeek, slot: MealSlot, dayLabel: string) => {
    setModalState({
      isOpen: true,
      day,
      slot,
      dayLabel,
      slotLabel: slot === 'lunch' ? 'Almuerzo / Comida' : 'Cena',
    });
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    if (modalState.day && modalState.slot) {
      onAssignMeal(modalState.day, modalState.slot, recipe);
    }
    setModalState({ isOpen: false });
  };

  const totalAssignedMeals = Object.values(plan).reduce((acc, day) => {
    return acc + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0);
  }, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '20px 24px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(234, 88, 12, 0.15)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Planificador de Menu Semanal
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Organiza tus comidas de lunes a domingo. Los ingredientes se anadiran automaticamente a tu lista de la compra.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {totalAssignedMeals} de 14 comidas programadas
          </span>

          {totalAssignedMeals > 0 && (
            <button
              onClick={onClearPlan}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} />
              Vaciar plan semanal
            </button>
          )}
        </div>
      </div>

      {/* 7 Days Columns Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {DAYS_OF_WEEK.map(({ key: dayKey, label: dayLabel }) => {
          const dayPlan = plan[dayKey];

          return (
            <div
              key={dayKey}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{dayLabel}</span>
              </div>

              {/* Lunch Slot */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <Utensils size={13} />
                  <span>Almuerzo / Comida</span>
                </div>

                {dayPlan.lunch ? (
                  <PlannerMealItem
                    recipe={dayPlan.lunch}
                    onOpenDetail={() => onOpenRecipeDetail(dayPlan.lunch!)}
                    onRemove={() => onRemoveMeal(dayKey, 'lunch')}
                    removeAriaLabel={`Quitar receta de almuerzo del ${dayLabel}`}
                  />
                ) : (
                  <button
                    onClick={() => handleOpenAssignModal(dayKey, 'lunch', dayLabel)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px dashed var(--border-color)',
                      color: 'var(--text-dim)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast), color var(--transition-fast)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-dim)';
                    }}
                  >
                    <Plus size={14} />
                    Asignar comida
                  </button>
                )}
              </div>

              {/* Dinner Slot */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700 }}>
                  <Moon size={13} />
                  <span>Cena</span>
                </div>

                {dayPlan.dinner ? (
                  <PlannerMealItem
                    recipe={dayPlan.dinner}
                    onOpenDetail={() => onOpenRecipeDetail(dayPlan.dinner!)}
                    onRemove={() => onRemoveMeal(dayKey, 'dinner')}
                    removeAriaLabel={`Quitar receta de cena del ${dayLabel}`}
                  />
                ) : (
                  <button
                    onClick={() => handleOpenAssignModal(dayKey, 'dinner', dayLabel)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px dashed var(--border-color)',
                      color: 'var(--text-dim)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast), color var(--transition-fast)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#60a5fa';
                      e.currentTarget.style.color = '#60a5fa';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-dim)';
                    }}
                  >
                    <Plus size={14} />
                    Asignar cena
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Select Recipe Modal */}
      {modalState.isOpen && (
        <RecipeSelectModal
          recipes={recipes}
          dayLabel={modalState.dayLabel || ''}
          slotLabel={modalState.slotLabel || ''}
          onSelect={handleSelectRecipe}
          onClose={() => setModalState({ isOpen: false })}
        />
      )}
    </div>
  );
};
