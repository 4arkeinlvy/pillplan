import { describe, expect, it } from 'vitest';
import { customMedicine, type Medicine } from '@/features/medicines';
import { en, id } from '@/shared/i18n';
import { buildChart } from './buildChart';
import { doseKey, toIsoDate, trackerDays } from './tracker';

const med = (id: string, patch: Partial<Medicine>): Medicine => ({
  ...customMedicine(id, id),
  ...patch,
});

describe('buildChart', () => {
  const chart = buildChart(
    [
      med('metformin', { times: ['morning', 'evening'] }),
      med('simvastatin', { times: ['bedtime'], amount: 0.5 }),
      med('paracetamol', { prn: true, times: [], prnMaxPerDay: 4 }),
    ],
    en,
  );

  it('puts each dose in its time-of-day column', () => {
    const [metformin, simvastatin] = chart.rows;
    expect(metformin?.cells.morning).toEqual({ amount: '1', formName: 'tablet' });
    expect(metformin?.cells.noon).toBeNull();
    expect(simvastatin?.cells.bedtime).toEqual({ amount: '½', formName: 'tablet' });
  });

  it('keeps when-needed medicines out of the grid', () => {
    expect(chart.rows).toHaveLength(2);
    expect(chart.whenNeeded.map((m) => m.id)).toEqual(['paracetamol']);
  });

  it('uses the chosen language for form names', () => {
    const [row] = buildChart([med('a', { times: ['noon'], amount: 2, form: 'capsule' })], id).rows;
    expect(row?.cells.noon).toEqual({ amount: '2', formName: 'kapsul' });
  });

  it('counts medicines per time and lists used times in day order', () => {
    expect(chart.counts).toEqual({ morning: 1, noon: 0, evening: 1, bedtime: 1 });
    expect(chart.usedSlots).toEqual(['morning', 'evening', 'bedtime']);
  });
});

describe('tracker', () => {
  it('builds stable keys', () => {
    expect(doseKey(3, 'noon')).toBe('d3-noon');
  });

  it('lists seven days from the start date, across month ends', () => {
    const days = trackerDays('2026-11-29');
    expect(days).toHaveLength(7);
    expect(days[0]?.label).toBe('Sun');
    expect(days[2]?.longLabel).toBe('Tuesday, December 1');
    expect(trackerDays('2026-11-29', 'id-ID')[2]?.label).toBe('Sel');
  });

  it('formats local dates without time zone shifts', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
