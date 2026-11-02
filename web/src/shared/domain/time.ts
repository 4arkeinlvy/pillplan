/** Shared kernel: the small vocabulary every feature agrees on. */

/** Universal Medication Schedule: four standard times of day. */
export const TIME_SLOTS = ['morning', 'noon', 'evening', 'bedtime'] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const FOOD_RULES = ['before', 'with_after', 'any'] as const;
export type FoodRule = (typeof FOOD_RULES)[number];

export const DOSE_FORMS = ['tablet', 'capsule', 'mL', 'puff', 'drop'] as const;
export type DoseForm = (typeof DOSE_FORMS)[number];

export const DOSE_UNITS = ['mg', 'mcg'] as const;
export type DoseUnit = (typeof DOSE_UNITS)[number];

export function isTimeSlot(value: string): value is TimeSlot {
  return (TIME_SLOTS as readonly string[]).includes(value);
}

/** How far the amount stepper moves for each form. Capsules cannot be split. */
export function amountStep(form: DoseForm): number {
  return form === 'tablet' || form === 'mL' ? 0.5 : 1;
}
