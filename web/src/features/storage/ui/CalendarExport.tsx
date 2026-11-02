import { useState } from 'react';
import { usePlan } from '@/features/medicines';
import { TIME_SLOTS, type TimeSlot } from '@/shared/domain/time';
import { useI18n } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Stepper } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { downloadBlob } from '../logic/file';
import { buildIcs, DEFAULT_CLOCK, type ClockTimes } from '../logic/ics';
import styles from './CalendarExport.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const split = (time: string): [number, number] => {
  const [h, m] = time.split(':').map(Number);
  return [h ?? 0, m ?? 0];
};

/** Hands the schedule to the phone's own calendar, so no reminder app is needed. */
export function CalendarExport() {
  const { plan } = usePlan();
  const { t } = useI18n();
  const [clock, setClock] = useState<ClockTimes>(DEFAULT_CLOCK);
  const [editing, setEditing] = useState<TimeSlot | null>(null);
  const used = TIME_SLOTS.filter((slot) =>
    plan.medicines.some((m) => !m.prn && m.times.includes(slot)),
  );
  const separator = t.locale === 'id-ID' ? '.' : ':';
  const show = (time: string) => time.replace(':', separator);

  const setPart = (slot: TimeSlot, hour: number, minute: number) =>
    setClock((current) => ({ ...current, [slot]: `${pad(hour)}:${pad(minute)}` }));

  const download = () => {
    const ics = buildIcs(plan, clock, t, new Date());
    if (ics) downloadBlob(new Blob([ics], { type: 'text/calendar' }), 'pillplan-reminders.ics');
  };

  if (used.length === 0) return <p className={styles.hint}>{t.calendar.none}</p>;

  return (
    <div className={styles.calendar}>
      <p className={styles.hint}>{t.calendar.hint}</p>
      <ul className={styles.rows} aria-label={t.calendar.times}>
        {used.map((slot) => {
          const [hour, minute] = split(clock[slot]);
          const open = editing === slot;
          return (
            <li key={slot} className={styles.row} data-open={open || undefined}>
              <button
                type="button"
                className={styles.summary}
                aria-expanded={open}
                onClick={() => setEditing(open ? null : slot)}
              >
                <Icon name={slot} />
                <span className={styles.slot}>{t.slots[slot]}</span>
                <span className={styles.time}>{show(clock[slot])}</span>
                <Icon name="chevron" size={18} className={styles.chevron} />
              </button>
              {open && (
                <div className={styles.picker}>
                  <Stepper
                    label={t.calendar.hour}
                    value={hour}
                    step={1}
                    min={0}
                    max={23}
                    lessLabel={t.form.less}
                    moreLabel={t.form.more}
                    onChange={(value) => Number.isFinite(value) && setPart(slot, value, minute)}
                  />
                  <Stepper
                    label={t.calendar.minute}
                    value={minute}
                    step={15}
                    min={0}
                    max={45}
                    lessLabel={t.form.less}
                    moreLabel={t.form.more}
                    onChange={(value) => Number.isFinite(value) && setPart(slot, hour, value)}
                  />
                  <Button variant="quiet" icon="check" onClick={() => setEditing(null)}>
                    {t.calendar.done}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Button variant="primary" icon="download" onClick={download}>
        {t.calendar.export}
      </Button>
    </div>
  );
}
