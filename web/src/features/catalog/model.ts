import type { DoseUnit, FoodRule, TimeSlot } from '@/shared/domain/time';
import type { StickerTone } from '@/shared/ui/Sticker';

/** Shapes of the generated catalog.json (validated by the Python tools at build time). */
export interface WarningLabel {
  id: string;
  short: string;
  text: string;
  icon: string;
  sticker: StickerTone;
}

export interface Ingredient {
  id: string;
  name: string;
  usualMaxDaily: number | null;
  unit: DoseUnit;
  source: string;
}

export interface Drug {
  id: string;
  name: string;
  brands: string[];
  ingredients: string[];
  drugClass: string;
  area: string;
  form: 'tablet' | 'capsule';
  strengths: number[][];
  unit: DoseUnit;
  defaultTimes: TimeSlot[];
  defaultPrn: boolean;
  bestTimes: TimeSlot[];
  food: FoodRule;
  warnings: string[];
  advice: string;
  source: string;
}

export interface CatalogData {
  version: number;
  warnings: WarningLabel[];
  ingredients: Ingredient[];
  drugs: Drug[];
}

export interface Catalog extends CatalogData {
  drugById: ReadonlyMap<string, Drug>;
  ingredientById: ReadonlyMap<string, Ingredient>;
  warningById: ReadonlyMap<string, WarningLabel>;
}
