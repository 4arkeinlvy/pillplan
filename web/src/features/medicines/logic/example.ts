import type { Catalog } from '@/features/catalog';
import type { PillShape, PlanState } from '../model';
import { medicineFromDrug } from './fromDrug';

interface ExampleItem {
  drugId: string;
  strengthIndex: number;
  purpose: string;
  shape: PillShape;
  color: string;
  amount?: number;
  prnMaxPerDay?: number;
}

/** A made-up patient used for demos and screenshots. */
export const EXAMPLE_ITEMS: readonly ExampleItem[] = [
  {
    drugId: 'metformin',
    strengthIndex: 0,
    purpose: 'for diabetes',
    shape: 'oval',
    color: '#FFFFFF',
  },
  {
    drugId: 'amlodipine',
    strengthIndex: 1,
    purpose: 'for blood pressure',
    shape: 'round',
    color: '#FFFFFF',
  },
  {
    drugId: 'simvastatin',
    strengthIndex: 1,
    purpose: 'for cholesterol',
    shape: 'oval',
    color: '#F7A8B8',
  },
  {
    drugId: 'paracetamol',
    strengthIndex: 0,
    purpose: 'for pain',
    shape: 'capsule',
    color: '#FFFFFF',
    amount: 2,
    prnMaxPerDay: 4,
  },
];

export function buildExamplePlan(catalog: Catalog, today: string, newId: () => string): PlanState {
  const medicines = EXAMPLE_ITEMS.flatMap((item) => {
    const drug = catalog.drugById.get(item.drugId);
    if (!drug) return [];
    const base = medicineFromDrug(drug, item.strengthIndex, newId());
    return [
      {
        ...base,
        purpose: item.purpose,
        pill: { shape: item.shape, color: item.color },
        amount: item.amount ?? base.amount,
        prnMaxPerDay: item.prnMaxPerDay ?? base.prnMaxPerDay,
      },
    ];
  });
  return {
    patientName: 'Example patient',
    medicines,
    tracker: { start: today, popped: ['d0-morning'] },
  };
}
