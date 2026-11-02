import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useCatalog } from '@/features/catalog';
import { PillPreview, usePlan } from '@/features/medicines';
import { formatDose } from '@/shared/format/dose';
import { strings } from '@/shared/strings';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Sticker } from '@/shared/ui/Sticker';
import { useModalDialog } from '@/shared/ui/useModalDialog';
import styles from './CounselingMode.module.css';

interface CounselingModeProps {
  onClose: () => void;
}

/** Full screen, one medicine at a time, for explaining the plan to a patient. */
export function CounselingMode({ onClose }: CounselingModeProps) {
  const { plan } = usePlan();
  const catalog = useCatalog();
  const ref = useModalDialog(true, onClose);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [index, setIndex] = useState(0);
  const total = plan.medicines.length;
  const medicine = plan.medicines[Math.min(index, total - 1)];

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  if (!medicine) return null;
  const isLast = index >= total - 1;
  const go = (step: number) =>
    setIndex((current) => Math.min(total - 1, Math.max(0, current + step)));

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
  };

  const dose = formatDose(medicine.amount, medicine.form);
  const warnings = medicine.warnings.flatMap((id) => {
    const warning = catalog?.warningById.get(id);
    return warning ? [warning] : [];
  });

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label={strings.counsel.title}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.frame}>
        <div className={styles.top}>
          <p className={styles.progress} aria-live="polite">
            {strings.counsel.progress(index + 1, total)}
          </p>
          <div className={styles.dots} aria-hidden="true">
            {plan.medicines.map((m, i) => (
              <span key={m.id} className={styles.dot} data-current={i === index ? '' : undefined} />
            ))}
          </div>
          <Button variant="quiet" icon="close" onClick={onClose}>
            {strings.counsel.close}
          </Button>
        </div>

        <div className={styles.body}>
          <div className={styles.title}>
            <PillPreview pill={medicine.pill} size={120} />
            <h2 ref={headingRef} tabIndex={-1}>
              {medicine.name}
              <span className={styles.strength}>{medicine.strength}</span>
            </h2>
          </div>

          {medicine.purpose && (
            <div>
              <p className={styles.label}>{strings.counsel.whatFor}</p>
              <p>{medicine.purpose}</p>
            </div>
          )}

          <div>
            <p className={styles.label}>{strings.counsel.when}</p>
            <ul className={styles.times}>
              {medicine.prn ? (
                <li className={styles.time}>
                  <Icon name="prn" size={24} />
                  {strings.chart.prnLine(dose, medicine.prnMaxPerDay)}
                </li>
              ) : (
                medicine.times.map((slot) => (
                  <li key={slot} className={styles.time}>
                    <Icon name={slot} size={24} />
                    {strings.counsel.at(strings.slots[slot], dose)}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <p className={styles.label}>{strings.counsel.how}</p>
            <p>{strings.foodLong[medicine.food]}</p>
          </div>

          {warnings.length > 0 && (
            <div>
              <p className={styles.label}>{strings.counsel.warnings}</p>
              <ul className={styles.stickers}>
                {warnings.map((warning) => (
                  <li key={warning.id}>
                    <Sticker tone={warning.sticker} icon={warning.icon} large>
                      {warning.text}
                    </Sticker>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {medicine.advice && (
            <div>
              <p className={styles.label}>{strings.counsel.note}</p>
              <p>{medicine.advice}</p>
            </div>
          )}
        </div>

        <div className={styles.nav}>
          <Button icon="back" disabled={index === 0} onClick={() => go(-1)}>
            {strings.counsel.back}
          </Button>
          {isLast ? (
            <Button variant="primary" icon="check" onClick={onClose}>
              {strings.counsel.done}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => go(1)}>
              {strings.counsel.next}
              <Icon name="next" />
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
