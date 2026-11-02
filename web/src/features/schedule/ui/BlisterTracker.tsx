import { usePlan } from '@/features/medicines';
import type { TimeSlot } from '@/shared/domain/time';
import { useI18n } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { doseKey, trackerDays } from '../logic/tracker';
import styles from './BlisterTracker.module.css';

interface BlisterTrackerProps {
  slots: readonly TimeSlot[];
  today: string;
}

/** A week drawn like a blister pack: one bubble per time of day, popped when taken. */
export function BlisterTracker({ slots, today }: BlisterTrackerProps) {
  const { t } = useI18n();
  const { plan, dispatch } = usePlan();
  if (slots.length === 0) return null;
  const days = trackerDays(plan.tracker.start, t.locale);
  const popped = new Set(plan.tracker.popped);

  return (
    <section className={styles.tracker} aria-labelledby="tracker-heading">
      <div className={styles.head}>
        <h3 id="tracker-heading">{t.tracker.heading}</h3>
        <p className={styles.hint}>{t.tracker.hint}</p>
      </div>
      <table className={styles.pack} aria-labelledby="tracker-heading">
        <thead>
          <tr>
            <td />
            {days.map((day) => (
              <th key={day.index} scope="col" abbr={day.longLabel}>
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot}>
              <th scope="row">
                <span className={styles.rowLabel}>
                  <Icon name={slot} size={16} />
                  <span className={styles.rowText}>{t.slots[slot]}</span>
                </span>
              </th>
              {days.map((day) => {
                const key = doseKey(day.index, slot);
                const taken = popped.has(key);
                return (
                  <td key={key}>
                    <button
                      type="button"
                      className={styles.bubble}
                      aria-pressed={taken}
                      aria-label={t.tracker.bubble(day.longLabel, t.slots[slot], taken)}
                      onClick={() => dispatch({ type: 'toggleDose', key })}
                    >
                      {taken && <Icon name="check" size={18} />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`${styles.reset} no-print`}>
        <Button variant="quiet" onClick={() => dispatch({ type: 'resetTracker', start: today })}>
          {t.tracker.reset}
        </Button>
      </div>
    </section>
  );
}
