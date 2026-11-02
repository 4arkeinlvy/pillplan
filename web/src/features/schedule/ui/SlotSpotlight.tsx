import { TIME_SLOTS, type TimeSlot } from '@/shared/domain/time';
import { strings } from '@/shared/strings';
import { Icon } from '@/shared/ui/Icon';
import styles from './SlotSpotlight.module.css';

interface SlotSpotlightProps {
  counts: Record<TimeSlot, number>;
  selected: TimeSlot | null;
  onSelect: (slot: TimeSlot | null) => void;
}

/** Day ribbon: how many medicines at each time, and a toggle to highlight that column. */
export function SlotSpotlight({ counts, selected, onSelect }: SlotSpotlightProps) {
  const most = Math.max(1, ...TIME_SLOTS.map((slot) => counts[slot]));
  return (
    <div
      className={`${styles.ribbon} no-print`}
      role="group"
      aria-label={strings.chart.spotlightLabel}
    >
      {TIME_SLOTS.map((slot) => (
        <button
          key={slot}
          type="button"
          className={styles.slot}
          aria-pressed={selected === slot}
          onClick={() => onSelect(selected === slot ? null : slot)}
        >
          <span className={styles.top}>
            <Icon name={slot} size={18} />
            {strings.slots[slot]}
          </span>
          <svg
            className={styles.bar}
            viewBox="0 0 100 8"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect width="100" height="8" fill="var(--rule)" />
            <rect width={(counts[slot] / most) * 100} height="8" fill="var(--ink)" />
          </svg>
          <span className={styles.count}>{strings.chart.medicinesAt(counts[slot])}</span>
        </button>
      ))}
    </div>
  );
}
