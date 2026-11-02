import type { CSSProperties } from 'react';
import type { Medicine } from '@/features/medicines';
import { TIME_SLOTS, type TimeSlot } from '@/shared/domain/time';
import { formatDose } from '@/shared/format/dose';
import { useI18n } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import styles from './DayTimeline.module.css';

/** Where each time sits on a line from sunrise to night, in percent. */
const POSITION: Record<TimeSlot, number> = { morning: 12, noon: 40, evening: 68, bedtime: 90 };

/**
 * One day drawn as a line from sunrise to night. The doses of the current medicine light up,
 * and a sun or moon marker slides to the first one when the medicine changes.
 */
export function DayTimeline({ medicine }: { medicine: Medicine }) {
  const { t } = useI18n();
  const first = TIME_SLOTS.find((slot) => medicine.times.includes(slot));
  const dose = formatDose(medicine.amount, medicine.form, t);

  return (
    <figure className={styles.timeline} aria-label={t.timeline.label}>
      <div className={styles.track}>
        {first && (
          <span
            className={styles.marker}
            style={{ '--at': `${POSITION[first]}%` } as CSSProperties}
            aria-hidden="true"
          >
            <Icon
              name={first === 'evening' || first === 'bedtime' ? 'bedtime' : 'noon'}
              size={22}
            />
          </span>
        )}
        {TIME_SLOTS.map((slot) => {
          const on = medicine.times.includes(slot);
          return (
            <span
              key={slot}
              className={styles.stop}
              data-on={on || undefined}
              style={{ '--at': `${POSITION[slot]}%` } as CSSProperties}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.label}>
                <Icon name={slot} size={18} />
                {t.slots[slot]}
              </span>
              {on && <span className={styles.dose}>{dose}</span>}
            </span>
          );
        })}
      </div>
    </figure>
  );
}
