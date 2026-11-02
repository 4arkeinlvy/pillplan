import { describe, expect, it } from 'vitest';
import { buildExamplePlan, emptyPlan } from '@/features/medicines';
import { en, id } from '@/shared/i18n';
import { testCatalog } from '@/test/catalog';
import { buildIcs, DEFAULT_CLOCK, isClockTime } from './ics';

let n = 0;
const now = new Date('2026-11-02T10:00:00Z');
const plan = () => buildExamplePlan(testCatalog, '2026-11-02', () => `id${n++}`, en, 'en');

describe('buildIcs', () => {
  it('makes one daily event with an alarm per time of day in use', () => {
    const ics = buildIcs(plan(), DEFAULT_CLOCK, en, now) ?? '';
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2 + 1);
    expect(ics).toContain('DTSTART:20261102T070000');
    expect(ics).toContain('DTSTART:20261102T210000');
    expect(ics).toContain('RRULE:FREQ=DAILY;COUNT=30');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('SUMMARY:Medicines: Morning');
    expect(ics.endsWith('\r\n')).toBe(true);
  });

  it('leaves out when-needed medicines', () => {
    expect(buildIcs(plan(), DEFAULT_CLOCK, en, now)).not.toContain('Paracetamol');
  });

  it('writes Indonesian text and keeps lines short', () => {
    const ics = buildIcs(plan(), DEFAULT_CLOCK, id, now) ?? '';
    expect(ics).toContain('SUMMARY:Obat: Pagi');
    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it('escapes commas and semicolons', () => {
    const base = plan();
    const first = base.medicines[0];
    if (!first) throw new Error('example plan is empty');
    const tricky = { ...base, medicines: [{ ...first, name: 'A, B; C' }] };
    expect(buildIcs(tricky, DEFAULT_CLOCK, en, now)).toContain('A\\, B\\; C');
  });

  it('returns null when there is nothing on a fixed time', () => {
    expect(buildIcs(emptyPlan('2026-11-02'), DEFAULT_CLOCK, en, now)).toBeNull();
  });

  it('checks clock times', () => {
    expect(isClockTime('07:30')).toBe(true);
    expect(isClockTime('24:00')).toBe(false);
    expect(isClockTime('7:30')).toBe(false);
  });
});
