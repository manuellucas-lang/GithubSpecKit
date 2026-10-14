import React, { useEffect, useState, useRef } from 'react';
import { RecipeImageCandidate } from '../../domain/models/recipe_image_candidate';
import { imageProviderClient } from '../../infrastructure/api/image_provider_client';
import { X, ChevronLeft, ChevronRight, Check, RotateCcw, Camera, Sparkles } from 'lucide-react';

/**
 * Props for the RecipeImageCarouselModal component.
 */
export interface RecipeImageCarouselModalProps {
  isOpen: boolean;
  recipeId: string;
  recipeTitle: string;
  keyword: string;
  currentImageUrl?: string;
  onSelectImage: (candidate: RecipeImageCandidate) => boolean;
  onResetDefault: () => void;
  onClose: () => void;
}

/**
 * Modal dialog presenting a horizontal, touch-friendly carousel of candidate
 * images for a given recipe, allowing users to select an alternative visual or reset to default.
 *
 * @param props - Component properties configuring modal state, recipe context, and event handlers.
 * @returns The rendered modal dialog element or null if closed.
 */
export const RecipeImageCarouselModal: React.FC<RecipeImageCarouselModalProps> = ({
  isOpen,
  recipeTitle,
  keyword,
  currentImageUrl,
  onSelectImage,
  onResetDefault,
  onClose,
}) => {

  const [candidates, setCandidates] = useState<RecipeImageCandidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const currentImageUrlRef = useRef(currentImageUrl);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    currentImageUrlRef.current = currentImageUrl;
  }, [currentImageUrl]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setSelectionError(null);

    imageProviderClient
      .fetchImageCandidatesByKeyword({ keyword, count: 6 })
      .then(res => {
        if (isMounted) {
          setCandidates(res);
          setIsLoading(false);
          // Highlight current if matches
          const match = res.find(c => c.url === currentImageUrlRef.current);
          if (match) {
            setSelectedCandidateId(match.id);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, keyword]);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;

    // Focus first interactive control or dialog container
    const focusTimer = setTimeout(() => {
      if (dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleChoose = (candidate: RecipeImageCandidate) => {
    if (onSelectImage(candidate)) {
      setSelectedCandidateId(candidate.id);
      setSelectionError(null);
    } else {
      setSelectionError('No se pudo guardar la imagen seleccionada. Inténtalo de nuevo.');
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="carousel-modal-title"
    >
      <div ref={dialogRef} tabIndex={-1} className="modal-content animate-fade-in" style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
              <Sparkles size={16} />
              <span>Galería de Imágenes Alternativas</span>
            </div>
            <h2 id="carousel-modal-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Seleccionar imagen alternativa
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {recipeTitle}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar selector de imagen"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {selectionError && (
          <p
            role="alert"
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 600,
              margin: '0 0 14px 0',
            }}
          >
            {selectionError}
          </p>
        )}

        {/* Carousel Area */}
        <div style={{ position: 'relative', marginTop: '12px', marginBottom: '20px' }}>
          {/* Nav buttons */}
          <button
            onClick={() => handleScroll('left')}
            aria-label="Desplazar hacia la izquierda"
            style={{
              position: 'absolute',
              left: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => handleScroll('right')}
            aria-label="Desplazar hacia la derecha"
            style={{
              position: 'absolute',
              right: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Carousel Track */}
          <div ref={scrollRef} className="carousel-container">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="carousel-card animate-pulse"
                  style={{ height: '220px', backgroundColor: 'var(--bg-surface-elevated)' }}
                />
              ))
            ) : candidates.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>
                No se encontraron imágenes alternativas para este plato en este momento.
              </div>
            ) : (
              candidates.map(candidate => {
                const isSelected = selectedCandidateId === candidate.id || candidate.url === currentImageUrl;
                return (
                  <div
                    key={candidate.id}
                    className={`carousel-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleChoose(candidate)}
                    style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ height: '170px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-app)' }}>
                      <img
                        src={candidate.thumbUrl || candidate.url}
                        alt={candidate.altDescription}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        <Camera size={12} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {candidate.photographerName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleChoose(candidate);
                        }}
                        aria-label={`Seleccionar esta opción: ${candidate.altDescription}`}
                        style={{
                          marginTop: '6px',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--color-primary)' : 'rgba(234, 88, 12, 0.15)',
                          color: isSelected ? '#fff' : 'var(--color-primary)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {isSelected && <Check size={14} />}
                        {isSelected ? 'Seleccionada' : 'Seleccionar'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <button
            onClick={() => {
              onResetDefault();
              setSelectedCandidateId(null);
              setSelectionError(null);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <RotateCcw size={14} />
            Restablecer por defecto
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
