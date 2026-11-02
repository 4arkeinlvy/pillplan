import { strings } from '@/shared/strings';
import type { Medicine } from '../model';

export type MedicineErrors = Partial<Record<'name' | 'amount' | 'times' | 'maxPerDay', string>>;

export function validateMedicine(medicine: Medicine): MedicineErrors {
  const errors: MedicineErrors = {};
  if (!medicine.name.trim()) errors.name = strings.form.errors.name;
  if (!Number.isFinite(medicine.amount) || medicine.amount <= 0) {
    errors.amount = strings.form.errors.amount;
  }
  if (!medicine.prn && medicine.times.length === 0) errors.times = strings.form.errors.times;
  const max = medicine.prnMaxPerDay;
  if (medicine.prn && (max === null || !Number.isInteger(max) || max < 1 || max > 24)) {
    errors.maxPerDay = strings.form.errors.maxPerDay;
  }
  return errors;
}
