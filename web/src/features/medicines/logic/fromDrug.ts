import type { Drug, MyDrug } from '@/features/catalog';
import { formatStrength } from '@/shared/format/dose';
import type { Lang } from '@/shared/i18n';
import type { Medicine } from '../model';

export const DEFAULT_PRN_MAX = 4;
const WHITE = '#FFFFFF';

/** A new medicine pre-filled from the catalog, in the chosen language. Every field stays editable. */
export function medicineFromDrug(
  drug: Drug,
  strengthIndex: number,
  id: string,
  lang: Lang,
): Medicine {
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
    advice: drug.advice[lang],
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

/** A medicine from one of the apoteker's own saved drugs. */
export function medicineFromMyDrug(drug: MyDrug, id: string): Medicine {
  return {
    ...customMedicine(drug.name, id),
    strength: drug.strength,
    form: drug.form,
    times: [...drug.times],
    prn: drug.prn,
    prnMaxPerDay: drug.prnMaxPerDay,
    food: drug.food,
    warnings: [...drug.warnings],
    advice: drug.advice,
    pill: { shape: drug.form === 'capsule' ? 'capsule' : 'round', color: WHITE },
  };
}

/** What gets remembered when a custom medicine is saved to "My drugs". */
export function toMyDrug(medicine: Medicine, id: string): MyDrug {
  return {
    id,
    name: medicine.name.trim(),
    strength: medicine.strength,
    form: medicine.form,
    times: [...medicine.times],
    prn: medicine.prn,
    prnMaxPerDay: medicine.prnMaxPerDay,
    food: medicine.food,
    warnings: [...medicine.warnings],
    advice: medicine.advice,
  };
}
