import { useMemo } from 'react';
import { useCatalog } from '@/features/catalog';
import { usePlan } from '@/features/medicines';
import { useI18n } from '@/shared/i18n';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { runSafetyChecks } from '../logic/checks';
import type { Severity } from '../model';
import styles from './SafetyNotes.module.css';

const ICON: Record<Severity, IconName> = { alert: 'alert', caution: 'alert', info: 'info' };

/** Notes for the pharmacist or student. They are not printed on the patient's chart. */
interface SafetyNotesProps {
  /** Tell the chart which medicines a note is about while it is hovered or focused. */
  onHighlight?: (medicineIds: readonly string[]) => void;
}

export function SafetyNotes({ onHighlight }: SafetyNotesProps) {
  const { plan } = usePlan();
  const catalog = useCatalog();
  const { t, lang } = useI18n();
  const notes = useMemo(
    () => (catalog ? runSafetyChecks(plan.medicines, catalog, t, lang) : []),
    [catalog, plan.medicines, t, lang],
  );
  if (plan.medicines.length === 0) return null;

  return (
    <section aria-labelledby="safety-heading">
      <h2 id="safety-heading" className={styles.heading}>
        {t.safety.heading} ({notes.length})
      </h2>
      {notes.length === 0 ? (
        <div className={styles.none}>
          <p>{t.safety.none}</p>
          <p>{t.safety.noneDetail}</p>
        </div>
      ) : (
        <ul className={styles.list} aria-live="polite">
          {notes.map((note) => (
            <li
              key={note.id}
              className={`${styles.note} ${styles[note.severity]}`}
              tabIndex={0}
              onMouseEnter={() => onHighlight?.(note.medicineIds)}
              onMouseLeave={() => onHighlight?.([])}
              onFocus={() => onHighlight?.(note.medicineIds)}
              onBlur={() => onHighlight?.([])}
            >
              <Icon name={ICON[note.severity]} size={22} />
              <div>
                <p className={styles.title}>{note.title}</p>
                <p className={styles.detail}>{note.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
