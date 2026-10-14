import React, { useState, useEffect, useTransition } from 'react';
import { Recipe } from '@shared/models/recipe';
import { AllergenCode } from '@shared/models/allergen';
import { WeeklyPlan, DayOfWeek, MealSlot } from '@shared/models/weekly_plan';
import { recipeService } from './services/recipe_service';
import { plannerService } from './services/planner_service';
import { shoppingListService } from './services/shopping_list_service';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { SearchFilters } from './components/SearchFilters';
import { SkeletonCard } from './components/SkeletonCard';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { ShoppingListView } from './components/ShoppingListView';
import { UtensilsCrossed, Calendar, ShoppingBag, BookOpen, Sparkles } from 'lucide-react';
import './styles/theme.css';

type ActiveTab = 'catalog' | 'planner' | 'shopping';

export const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [excludedAllergens, setExcludedAllergens] = useState<AllergenCode[]>([]);
  const [maxTotalMinutes, setMaxTotalMinutes] = useState<number | undefined>(undefined);

  // Weekly planner and shopping list state
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => plannerService.getWeeklyPlan());
  const [checkedItemKeys, setCheckedItemKeys] = useState<string[]>([]);

  const [, startTransition] = useTransition();

  // Load recipes whenever filters change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    recipeService
      .getRecipes({
        searchQuery,
        excludedAllergens,
        maxTotalMinutes,
      })
      .then(data => {
        if (isMounted) {
          startTransition(() => {
            setRecipes(data);
            setIsLoading(false);
          });
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : 'Error al conectar con el servidor');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, excludedAllergens, maxTotalMinutes, reloadKey]);

  // Derived shopping list items
  const shoppingItems = shoppingListService.generateShoppingList(weeklyPlan, checkedItemKeys);

  const totalAssignedMeals = Object.values(weeklyPlan).reduce((acc, day) => {
    return acc + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0);
  }, 0);

  const handleToggleExcludeAllergen = (code: AllergenCode) => {
    setExcludedAllergens(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setExcludedAllergens([]);
    setMaxTotalMinutes(undefined);
  };

  const handleAssignMeal = (day: DayOfWeek, slot: MealSlot, recipe: Recipe) => {
    const updated = plannerService.assignMeal(day, slot, recipe);
    setWeeklyPlan(updated);
  };

  const handleRemoveMeal = (day: DayOfWeek, slot: MealSlot) => {
    const updated = plannerService.removeMeal(day, slot);
    setWeeklyPlan(updated);
  };

  const handleClearPlan = () => {
    const updated = plannerService.clearPlan();
    setWeeklyPlan(updated);
    setCheckedItemKeys([]);
  };

  const handleToggleShoppingItem = (itemKey: string) => {
    setCheckedItemKeys(prev =>
      prev.includes(itemKey) ? prev.filter(k => k !== itemKey) : [...prev, itemKey]
    );
  };

  const handleCopyText = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Brand */}
          <div
            onClick={() => {
              setSelectedRecipe(null);
              setActiveTab('catalog');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <UtensilsCrossed size={20} color="#ffffff" strokeWidth={2.4} />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                GourmetCraft
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Recetario y Planificador Semanal
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} aria-label="Navegacion principal">
            <button
              onClick={() => {
                setSelectedRecipe(null);
                setActiveTab('catalog');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: activeTab === 'catalog' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'catalog' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <BookOpen size={16} />
              Catalogo
            </button>

            <button
              onClick={() => {
                setSelectedRecipe(null);
                setActiveTab('planner');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: activeTab === 'planner' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'planner' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative',
              }}
            >
              <Calendar size={16} />
              Menu Semanal
              {totalAssignedMeals > 0 && (
                <span
                  style={{
                    backgroundColor: activeTab === 'planner' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(234, 88, 12, 0.2)',
                    color: activeTab === 'planner' ? '#fff' : 'var(--color-primary)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  {totalAssignedMeals}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedRecipe(null);
                setActiveTab('shopping');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: activeTab === 'shopping' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'shopping' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <ShoppingBag size={16} />
              Lista Compra
              {shoppingItems.length > 0 && (
                <span
                  style={{
                    backgroundColor: activeTab === 'shopping' ? 'rgba(0, 0, 0, 0.25)' : 'var(--color-success-bg)',
                    color: activeTab === 'shopping' ? '#fff' : 'var(--color-success)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  {shoppingItems.length}
                </span>
              )}
            </button>
          </nav>

          {/* Badge */}
          <div style={{ display: 'none', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-muted)',
                fontWeight: 600,
                border: '1px solid var(--border-color)',
              }}
            >
              <Sparkles size={13} color="var(--color-primary)" />
              React 19
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '32px 24px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        {selectedRecipe ? (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
          />
        ) : activeTab === 'planner' ? (
          <WeeklyPlanner
            plan={weeklyPlan}
            recipes={recipes}
            onAssignMeal={handleAssignMeal}
            onRemoveMeal={handleRemoveMeal}
            onClearPlan={handleClearPlan}
            onOpenRecipeDetail={r => setSelectedRecipe(r)}
          />
        ) : activeTab === 'shopping' ? (
          <ShoppingListView
            items={shoppingItems}
            onToggleItem={handleToggleShoppingItem}
            onClearChecked={() => setCheckedItemKeys([])}
            onCopyText={handleCopyText}
            onNavigateToPlanner={() => setActiveTab('planner')}
          />
        ) : (
          <div>
            {/* Hero Greeting Section */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-main)',
                  marginBottom: '10px',
                }}
              >
                Inspiracion Culinaria con Transparencia Total
              </h1>
              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-muted)',
                  maxWidth: '680px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                }}
              >
                Explora recetas gourmet, programa tus platos en el menu semanal y obten tu lista de la compra calculada automaticamente.
              </p>
            </div>

            {/* Search and Filters */}
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              excludedAllergens={excludedAllergens}
              onToggleExcludeAllergen={handleToggleExcludeAllergen}
              maxTotalMinutes={maxTotalMinutes}
              onMaxTotalMinutesChange={setMaxTotalMinutes}
              onClearFilters={handleClearFilters}
              totalResultsCount={recipes.length}
            />

            {/* Recipes Grid */}
            {loadError ? (
              <div
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                  marginBottom: '24px',
                  border: '1px solid var(--color-danger)',
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: '12px' }}>{loadError}</p>
                <button
                  onClick={() => setReloadKey(k => k + 1)}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Reintentar
                </button>
              </div>
            ) : isLoading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : recipes.length === 0 ? (
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
                    backgroundColor: 'rgba(234, 88, 12, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <UtensilsCrossed size={28} color="var(--color-primary)" />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  No se encontraron recetas con los filtros aplicados
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 20px' }}>
                  Prueba a ajustar tus terminos de busqueda o desactiva algunas exclusiones de alergenos para ver mas resultados.
                </p>
                <button
                  onClick={handleClearFilters}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                  }}
                >
                  Restablecer todos los filtros
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {recipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} onSelect={setSelectedRecipe} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.82rem',
          marginTop: 'auto',
        }}
      >
        <p>GourmetCraft - Catalogo de Recetas, Planificador Semanal y Lista de la Compra en React 19</p>
      </footer>
    </div>
  );
};
