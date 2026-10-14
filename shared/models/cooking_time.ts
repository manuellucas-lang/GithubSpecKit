/**
 * Value object representing culinary preparation, cooking, and total duration.
 */
export interface CookingTime {
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  displayLabel: string;
}

/**
 * Creates and formats a CookingTime value object with human-readable localized label.
 *
 * @param prepMinutes - Minutes dedicated to preparation.
 * @param cookMinutes - Minutes dedicated to thermal cooking.
 * @returns Formatted CookingTime object.
 */
export function createCookingTime(prepMinutes: number, cookMinutes: number): CookingTime {
  if (prepMinutes < 0) {
    throw new Error('prepMinutes must be >= 0');
  }
  if (cookMinutes < 0) {
    throw new Error('cookMinutes must be >= 0');
  }

  const totalMinutes = prepMinutes + cookMinutes;

  let displayLabel = '';
  if (cookMinutes === 0 && prepMinutes === 0) {
    displayLabel = 'Preparación instantánea';
  } else if (cookMinutes === 0) {
    displayLabel = `${prepMinutes} min (Sin cocción térmica)`;
  } else if (totalMinutes < 60) {
    displayLabel = `${totalMinutes} min`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    displayLabel = mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
  }

  return {
    prepMinutes,
    cookMinutes,
    totalMinutes,
    displayLabel,
  };
}
