import type { CSSProperties, ReactNode, Ref } from 'react';
import { useI18n, type Strings } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { displayStrength } from '../logic/display';
import type { Medicine } from '../model';
import { PillPreview } from './PillPreview';
import styles from './MedicineList.module.css';

export interface MedicineListProps {
  medicines: readonly Medicine[];
  onMove: (from: number, to: number) => void;
  onEdit: (medicine: Medicine) => void;
  onRemove: (medicine: Medicine) => void;
}

export function scheduleSummary(medicine: Medicine, t: Strings): string {
  return medicine.prn
    ? t.list.prnSummary(medicine.prnMaxPerDay)
    : t.list.schedule(medicine.times.map((slot) => t.slots[slot]));
}

interface MedicineRowProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onRemove: (medicine: Medicine) => void;
  handle?: ReactNode;
  rowRef?: Ref<HTMLLIElement>;
  dragging?: boolean;
  style?: CSSProperties;
}

/** One medicine in the list: pill, name, schedule and the edit and remove buttons. */
export function MedicineRow({
  medicine,
  onEdit,
  onRemove,
  handle,
  rowRef,
  dragging,
  style,
}: MedicineRowProps) {
  const { t } = useI18n();
  return (
    <li ref={rowRef} className={`${styles.item} ${dragging ? styles.dragging : ''}`} style={style}>
      {handle ?? <span className={styles.handle} aria-hidden="true" />}
      <PillPreview pill={medicine.pill} size={36} />
      <div>
        <p className={styles.name}>
          {medicine.name} {displayStrength(medicine, t.locale)}
        </p>
        <p className={styles.summary}>
          {scheduleSummary(medicine, t)}
          {medicine.signa && <span className={styles.signa}> {medicine.signa}</span>}
        </p>
      </div>
      <div className={styles.actions}>
        <Button variant="quiet" icon="edit" onClick={() => onEdit(medicine)}>
          <span className="visually-hidden">{medicine.name}: </span>
          <span className={styles.actionText}>{t.list.edit}</span>
        </Button>
        <Button variant="quiet" icon="remove" onClick={() => onRemove(medicine)}>
          <span className="visually-hidden">{medicine.name}: </span>
          <span className={styles.actionText}>{t.list.remove}</span>
        </Button>
      </div>
    </li>
  );
}
