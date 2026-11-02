import { useMemo } from 'react';
import { useCatalog } from '@/features/catalog';
import { usePlan } from '@/features/medicines';
import { strings } from '@/shared/strings';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { runSafetyChecks } from '../logic/checks';
import type { Severity } from '../model';
import styles from './SafetyNotes.module.css';

const ICON: Record<Severity, IconName> = { alert: 'alert', caution: 'alert', info: 'info' };

/** Notes for the pharmacist or student. They are not printed on the patient's chart. */
export function SafetyNotes() {
  const { plan } = usePlan();
  const catalog = useCatalog();
  const notes = useMemo(
    () => (catalog ? runSafetyChecks(plan.medicines, catalog) : []),
    [catalog, plan.medicines],
  );
  if (plan.medicines.length === 0) return null;

  return (
    <section aria-labelledby="safety-heading">
      <h2 id="safety-heading" className={styles.heading}>
        {strings.safety.heading} ({notes.length})
      </h2>
      {notes.length === 0 ? (
        <div className={styles.none}>
          <p>{strings.safety.none}</p>
          <p>{strings.safety.noneDetail}</p>
        </div>
      ) : (
        <ul className={styles.list} aria-live="polite">
          {notes.map((note) => (
            <li key={note.id} className={`${styles.note} ${styles[note.severity]}`}>
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
