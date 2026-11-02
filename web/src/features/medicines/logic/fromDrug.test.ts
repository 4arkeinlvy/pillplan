import { describe, expect, it } from 'vitest';
import { testCatalog } from '@/test/catalog';
import { medicineFromDrug, withStrength } from './fromDrug';
import { buildExamplePlan } from './example';
import { validateMedicine } from './validate';

const drug = (id: string) => {
  const found = testCatalog.drugById.get(id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

describe('medicineFromDrug', () => {
  it('copies the catalog defaults', () => {
    const metformin = medicineFromDrug(drug('metformin'), 1, 'x');
    expect(metformin).toMatchObject({
      drugId: 'metformin',
      strength: '850 mg',
      ingredientAmounts: [850],
      times: ['morning', 'evening'],
      food: 'with_after',
      prn: false,
    });
  });

  it('sets a default limit for when-needed medicines', () => {
    const paracetamol = medicineFromDrug(drug('paracetamol'), 0, 'x');
    expect(paracetamol.prn).toBe(true);
    expect(paracetamol.prnMaxPerDay).toBe(4);
    expect(paracetamol.times).toEqual([]);
  });

  it('labels combination strengths', () => {
    expect(medicineFromDrug(drug('paracetamol_caffeine'), 0, 'x').strength).toBe('500 mg + 65 mg');
  });

  it('can switch strength', () => {
    const base = medicineFromDrug(drug('levothyroxine'), 0, 'x');
    const changed = withStrength(base, drug('levothyroxine'), 3);
    expect(changed.strength).toBe('88 mcg');
    expect(changed.ingredientAmounts).toEqual([88]);
  });
});

describe('validateMedicine', () => {
  const valid = medicineFromDrug(drug('amlodipine'), 0, 'x');

  it('accepts catalog defaults', () => {
    expect(validateMedicine(valid)).toEqual({});
  });

  it('needs a time unless taken when needed', () => {
    expect(validateMedicine({ ...valid, times: [] }).times).toBeDefined();
    expect(validateMedicine({ ...valid, times: [], prn: true, prnMaxPerDay: 3 })).toEqual({});
  });

  it('needs a sensible max per day for when-needed medicines', () => {
    expect(validateMedicine({ ...valid, prn: true, prnMaxPerDay: 0 }).maxPerDay).toBeDefined();
    expect(validateMedicine({ ...valid, prn: true, prnMaxPerDay: 2.5 }).maxPerDay).toBeDefined();
  });

  it('needs a name and a positive amount', () => {
    expect(validateMedicine({ ...valid, name: '  ' }).name).toBeDefined();
    expect(validateMedicine({ ...valid, amount: 0 }).amount).toBeDefined();
    expect(validateMedicine({ ...valid, amount: Number.NaN }).amount).toBeDefined();
  });
});

describe('buildExamplePlan', () => {
  it('uses only drugs that exist in the catalog', () => {
    let next = 0;
    const plan = buildExamplePlan(testCatalog, '2026-11-02', () => `id${next++}`);
    expect(plan.medicines.map((m) => m.drugId)).toEqual([
      'metformin',
      'amlodipine',
      'simvastatin',
      'paracetamol',
    ]);
    expect(plan.medicines.every((m) => Object.keys(validateMedicine(m)).length === 0)).toBe(true);
  });
});
