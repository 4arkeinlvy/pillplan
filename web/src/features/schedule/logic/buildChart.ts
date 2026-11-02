import type { Medicine } from '@/features/medicines';
import { TIME_SLOTS, type TimeSlot } from '@/shared/domain/time';
import { formatAmount, formName } from '@/shared/format/dose';

export interface ChartCell {
  amount: string;
  formName: string;
}

export interface ChartRow {
  medicine: Medicine;
  cells: Record<TimeSlot, ChartCell | null>;
}

export interface Chart {
  rows: ChartRow[];
  whenNeeded: Medicine[];
  /** Medicines due at each time of day. */
  counts: Record<TimeSlot, number>;
  /** Times of day with at least one dose, in day order. */
  usedSlots: TimeSlot[];
}

const emptyCounts = (): Record<TimeSlot, number> => ({
  morning: 0,
  noon: 0,
  evening: 0,
  bedtime: 0,
});

/** Universal Medication Schedule layout: one row per medicine, one column per time of day. */
export function buildChart(medicines: readonly Medicine[]): Chart {
  const counts = emptyCounts();
  const rows: ChartRow[] = [];
  const whenNeeded: Medicine[] = [];

  for (const medicine of medicines) {
    if (medicine.prn) {
      whenNeeded.push(medicine);
      continue;
    }
    const cell: ChartCell = {
      amount: formatAmount(medicine.amount, medicine.form),
      formName: formName(medicine.amount, medicine.form),
    };
    const cells = { morning: null, noon: null, evening: null, bedtime: null } as Record<
      TimeSlot,
      ChartCell | null
    >;
    for (const slot of medicine.times) {
      cells[slot] = cell;
      counts[slot] += 1;
    }
    rows.push({ medicine, cells });
  }

  return { rows, whenNeeded, counts, usedSlots: TIME_SLOTS.filter((slot) => counts[slot] > 0) };
}
