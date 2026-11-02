import type { Drug } from '@/features/catalog';
import { formatStrength } from '@/shared/format/dose';
import type { Medicine } from '../model';

export const DEFAULT_PRN_MAX = 4;
const WHITE = '#FFFFFF';

/** A new medicine pre-filled from the catalog. Every field stays editable. */
export function medicineFromDrug(drug: Drug, strengthIndex: number, id: string): Medicine {
  const amounts = drug.strengths[strengthIndex] ?? drug.strengths[0] ?? [];
  return {
    id,
    drugId: drug.id,
    name: drug.name,
    strength: formatStrength(amounts, drug.unit),
    ingredientAmounts: [...amounts],
    unit: drug.unit,
    amount: 1,
    form: drug.form,
    times: [...drug.defaultTimes],
    prn: drug.defaultPrn,
    prnMaxPerDay: drug.defaultPrn ? DEFAULT_PRN_MAX : null,
    food: drug.food,
    warnings: [...drug.warnings],
    purpose: '',
    advice: drug.advice,
    pill: { shape: drug.form === 'capsule' ? 'capsule' : 'round', color: WHITE },
  };
}

/** Switch a catalog medicine to another strength, keeping everything else. */
export function withStrength(medicine: Medicine, drug: Drug, strengthIndex: number): Medicine {
  const amounts = drug.strengths[strengthIndex] ?? medicine.ingredientAmounts;
  return {
    ...medicine,
    ingredientAmounts: [...amounts],
    strength: formatStrength(amounts, drug.unit),
  };
}

export function customMedicine(name: string, id: string): Medicine {
  return {
    id,
    drugId: null,
    name,
    strength: '',
    ingredientAmounts: [],
    unit: null,
    amount: 1,
    form: 'tablet',
    times: ['morning'],
    prn: false,
    prnMaxPerDay: null,
    food: 'any',
    warnings: [],
    purpose: '',
    advice: '',
    pill: { shape: 'round', color: WHITE },
  };
}
