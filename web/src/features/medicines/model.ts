import type { DoseForm, DoseUnit, FoodRule, TimeSlot } from '@/shared/domain/time';

export const PILL_SHAPES = ['round', 'oval', 'capsule'] as const;
export type PillShape = (typeof PILL_SHAPES)[number];

/** Real pill colors, not interface colors. */
export const PILL_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Yellow', hex: '#F6D55C' },
  { name: 'Orange', hex: '#F4A259' },
  { name: 'Pink', hex: '#F7A8B8' },
  { name: 'Red', hex: '#D64545' },
  { name: 'Blue', hex: '#6FA8DC' },
  { name: 'Green', hex: '#93C47D' },
  { name: 'Brown', hex: '#A47551' },
] as const;

export interface PillLook {
  shape: PillShape;
  color: string;
}

export interface Medicine {
  id: string;
  /** Catalog drug id, or null for a custom medicine that PillPlan cannot check. */
  drugId: string | null;
  name: string;
  strength: string;
  /** Amount of each catalog ingredient in one unit (tablet, capsule). Empty when custom. */
  ingredientAmounts: number[];
  unit: DoseUnit | null;
  /** Units per dose, for example 0.5 tablet. */
  amount: number;
  form: DoseForm;
  times: TimeSlot[];
  prn: boolean;
  /** Most doses a day when taken only when needed. */
  prnMaxPerDay: number | null;
  food: FoodRule;
  warnings: string[];
  purpose: string;
  advice: string;
  pill: PillLook;
}

export interface Tracker {
  /** First day of the week shown, as yyyy-mm-dd in local time. */
  start: string;
  /** Keys of doses ticked off, like "d0-morning". */
  popped: string[];
}

export interface PlanState {
  patientName: string;
  medicines: Medicine[];
  tracker: Tracker;
}

/** How many doses a day count towards daily totals. */
export function dosesPerDay(medicine: Medicine): number {
  return medicine.prn ? (medicine.prnMaxPerDay ?? 0) : medicine.times.length;
}
