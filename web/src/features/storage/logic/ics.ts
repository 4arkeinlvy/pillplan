import { displayStrength, type PlanState } from '@/features/medicines';
import { TIME_SLOTS, type TimeSlot } from '@/shared/domain/time';
import { formatDose } from '@/shared/format/dose';
import type { Strings } from '@/shared/i18n';

/** Clock times (HH:MM) for each part of the day. */
export type ClockTimes = Record<TimeSlot, string>;

export const DEFAULT_CLOCK: ClockTimes = {
  morning: '07:00',
  noon: '12:00',
  evening: '19:00',
  bedtime: '21:00',
};

export const REMINDER_DAYS = 30;

/** RFC 5545 text escaping. */
function escape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** RFC 5545 lines are at most 75 octets; longer lines continue with a leading space. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  for (const char of line) {
    if (new TextEncoder().encode(current + char).length > (parts.length === 0 ? 75 : 74)) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const stamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

/**
 * One daily repeating event per time of day that has medicines, each with an alarm.
 * Floating local time, so it rings at 07:00 wherever the phone is.
 */
export function buildIcs(plan: PlanState, clock: ClockTimes, t: Strings, now: Date): string | null {
  const day = plan.tracker.start.replace(/-/g, '');
  const events = TIME_SLOTS.flatMap((slot) => {
    const due = plan.medicines.filter((m) => !m.prn && m.times.includes(slot));
    if (due.length === 0) return [];
    const time = clock[slot].replace(':', '');
    const lines = due.map((m) =>
      t.calendar.eventLine(
        [m.name, displayStrength(m, t.locale)].filter(Boolean).join(' '),
        formatDose(m.amount, m.form, t),
      ),
    );
    const description = [...lines, t.calendar.repeats(REMINDER_DAYS)].join('\n');
    return [
      'BEGIN:VEVENT',
      `UID:pillplan-${day}-${slot}@pillplan`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${day}T${time}00`,
      'DURATION:PT15M',
      `RRULE:FREQ=DAILY;COUNT=${REMINDER_DAYS}`,
      `SUMMARY:${escape(t.calendar.eventTitle(t.slots[slot]))}`,
      `DESCRIPTION:${escape(description)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:PT0M',
      `DESCRIPTION:${escape(t.calendar.eventTitle(t.slots[slot]))}`,
      'END:VALARM',
      'END:VEVENT',
    ];
  });
  if (events.length === 0) return null;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PillPlan//Medicine schedule//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n')
    .concat('\r\n');
}

export function isClockTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
