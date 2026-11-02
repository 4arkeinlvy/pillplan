import { useState } from 'react';
import { usePlan } from '@/features/medicines';
import { TIME_SLOTS } from '@/shared/domain/time';
import { useI18n } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { downloadBlob } from '../logic/file';
import { buildIcs, DEFAULT_CLOCK, isClockTime, type ClockTimes } from '../logic/ics';
import styles from './StorageControls.module.css';

/** Hands the schedule to the phone's own calendar, so a reminder app is not needed. */
export function CalendarExport() {
  const { plan } = usePlan();
  const { t } = useI18n();
  const [clock, setClock] = useState<ClockTimes>(DEFAULT_CLOCK);
  const used = TIME_SLOTS.filter((slot) =>
    plan.medicines.some((m) => !m.prn && m.times.includes(slot)),
  );

  const download = () => {
    const ics = buildIcs(plan, clock, t, new Date());
    if (ics) downloadBlob(new Blob([ics], { type: 'text/calendar' }), 'pillplan-reminders.ics');
  };

  return (
    <div className={styles.calendar}>
      <h3 className={styles.subheading}>{t.calendar.heading}</h3>
      <p className={styles.hint}>{used.length > 0 ? t.calendar.hint : t.calendar.none}</p>
      {used.length > 0 && (
        <fieldset className={styles.clock}>
          <legend className="visually-hidden">{t.calendar.times}</legend>
          {used.map((slot) => (
            <label key={slot} className={styles.clockField}>
              <span>{t.slots[slot]}</span>
              <input
                type="time"
                value={clock[slot]}
                onChange={(event) => {
                  const value = event.target.value;
                  if (isClockTime(value)) setClock((current) => ({ ...current, [slot]: value }));
                }}
              />
            </label>
          ))}
        </fieldset>
      )}
      <Button icon="download" disabled={used.length === 0} onClick={download}>
        {t.calendar.export}
      </Button>
    </div>
  );
}
