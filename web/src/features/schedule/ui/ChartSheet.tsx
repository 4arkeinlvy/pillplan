import { useState } from 'react';
import { useCatalog, type Catalog } from '@/features/catalog';
import { PillPreview, usePlan, type Medicine } from '@/features/medicines';
import { TIME_SLOTS, type TimeSlot } from '@/shared/domain/time';
import { formatDose } from '@/shared/format/dose';
import { strings } from '@/shared/strings';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Sticker } from '@/shared/ui/Sticker';
import { buildChart } from '../logic/buildChart';
import { formatChartDate, toIsoDate } from '../logic/tracker';
import { BlisterTracker } from './BlisterTracker';
import { SlotSpotlight } from './SlotSpotlight';
import styles from './ChartSheet.module.css';

interface ChartSheetProps {
  today: Date;
  onExample: () => void;
}

/** The patient's chart, styled as an A4 sheet. This is the only part that prints. */
export function ChartSheet({ today, onExample }: ChartSheetProps) {
  const { plan } = usePlan();
  const catalog = useCatalog();
  const [spot, setSpot] = useState<TimeSlot | null>(null);
  const chart = buildChart(plan.medicines);
  const isEmpty = plan.medicines.length === 0;

  return (
    <article id="chart-sheet" className={styles.sheet} aria-labelledby="chart-heading">
      <header className={styles.header}>
        <h2 id="chart-heading">{strings.chart.heading}</h2>
        <dl className={styles.meta}>
          <dt>{strings.chart.patient}</dt>
          <dd>{plan.patientName || ' '}</dd>
          <dt>{strings.chart.date}</dt>
          <dd>{formatChartDate(today)}</dd>
        </dl>
      </header>

      {isEmpty ? (
        <div className={styles.blank}>
          <h3>{strings.chart.emptyTitle}</h3>
          <p>{strings.chart.emptyBody}</p>
          <Button className="no-print" icon="plus" onClick={onExample}>
            {strings.app.example}
          </Button>
        </div>
      ) : (
        <>
          {chart.rows.length > 0 && (
            <>
              <SlotSpotlight counts={chart.counts} selected={spot} onSelect={setSpot} />
              <div className={styles.tableWrap}>
                <table className={styles.chart} data-spot={spot ?? undefined}>
                  <caption className="visually-hidden">{strings.chart.caption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{strings.chart.medicine}</th>
                      {TIME_SLOTS.map((slot) => (
                        <th key={slot} scope="col" data-on={spot === slot ? '' : undefined}>
                          <span className={styles.slotHead}>
                            <Icon name={slot} size={26} />
                            <span className={styles.slotLabel}>{strings.slots[slot]}</span>
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.rows.map(({ medicine, cells }) => (
                      <tr
                        key={medicine.id}
                        style={{ viewTransitionName: `row-${medicine.id}` }}
                        data-off={spot && !cells[spot] ? '' : undefined}
                      >
                        <th scope="row">
                          <MedicineCell medicine={medicine} catalog={catalog} />
                        </th>
                        {TIME_SLOTS.map((slot) => {
                          const cell = cells[slot];
                          return (
                            <td key={slot} data-on={spot === slot ? '' : undefined}>
                              {cell ? (
                                <span className={styles.dose}>
                                  <span className={styles.amount}>{cell.amount}</span>
                                  <span className={styles.formName}>{cell.formName}</span>
                                </span>
                              ) : (
                                <span className={styles.empty}>
                                  <span aria-hidden="true">{'·'}</span>
                                  <span className="visually-hidden">{strings.chart.none}</span>
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {chart.whenNeeded.length > 0 && (
            <section className={styles.prn} aria-labelledby="prn-heading">
              <h3 id="prn-heading">
                <Icon name="prn" />
                {strings.chart.whenNeededHeading}
              </h3>
              <ul>
                {chart.whenNeeded.map((medicine) => (
                  <li key={medicine.id} style={{ viewTransitionName: `row-${medicine.id}` }}>
                    <MedicineCell medicine={medicine} catalog={catalog} />
                    <p className={styles.prnLine}>
                      {strings.chart.prnLine(
                        formatDose(medicine.amount, medicine.form),
                        medicine.prnMaxPerDay,
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <BlisterTracker slots={chart.usedSlots} today={toIsoDate(today)} />
        </>
      )}

      <footer className={styles.footer}>
        <p>{strings.chart.footer}</p>
        <p>{strings.app.disclaimer}</p>
      </footer>
    </article>
  );
}

function MedicineCell({ medicine, catalog }: { medicine: Medicine; catalog: Catalog | null }) {
  const warnings = medicine.warnings.flatMap((id) => {
    const warning = catalog?.warningById.get(id);
    return warning ? [warning] : [];
  });
  return (
    <div className={styles.medicine}>
      <PillPreview pill={medicine.pill} size={44} />
      <div>
        <p className={styles.name}>
          {medicine.name} <span className={styles.strength}>{medicine.strength}</span>
        </p>
        {medicine.purpose && <p className={styles.purpose}>{medicine.purpose}</p>}
        <p className={styles.food}>
          <Icon name="food" size={16} />
          {strings.food[medicine.food]}
        </p>
        {medicine.advice && <p className={styles.advice}>{medicine.advice}</p>}
        {warnings.length > 0 && (
          <div className={styles.stickers}>
            {warnings.map((warning) => (
              <Sticker key={warning.id} tone={warning.sticker} icon={warning.icon}>
                {warning.short}
              </Sticker>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
