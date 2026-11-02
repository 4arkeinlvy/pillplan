import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CatalogProvider, useCatalog } from '@/features/catalog';
import { buildExamplePlan, MedicinePanel, PlanProvider, usePlan } from '@/features/medicines';
import { SafetyNotes } from '@/features/safety';
import { ChartSheet, toIsoDate } from '@/features/schedule';
import { StorageControls, usePersistence } from '@/features/storage';
import { newId } from '@/shared/id';
import { strings } from '@/shared/strings';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/Field';
import { ToastProvider } from '@/shared/ui/Toast';
import { withViewTransition } from '@/shared/viewTransition';
import type { Catalog } from '@/features/catalog';
import { readStartup, type Startup } from './startup';
import { Wordmark } from './Wordmark';
import styles from './App.module.css';

const CounselingMode = lazy(() =>
  import('@/features/schedule/counseling').then((module) => ({ default: module.CounselingMode })),
);

export const REPO_URL = 'https://github.com/4arkeinlvy/pillplan';

interface AppProps {
  startup?: Startup;
  catalog?: Catalog;
}

export function App({ startup: given, catalog }: AppProps) {
  const [startup] = useState(() => given ?? readStartup());
  return (
    <CatalogProvider catalog={catalog}>
      <PlanProvider initial={startup.plan}>
        <ToastProvider>
          <Shell startup={startup} />
        </ToastProvider>
      </PlanProvider>
    </CatalogProvider>
  );
}

function Shell({ startup }: { startup: Startup }) {
  const { plan, dispatch } = usePlan();
  const catalog = useCatalog();
  const persistence = usePersistence(plan, startup.storage);
  const [counseling, setCounseling] = useState(startup.counsel);
  const demoDone = useRef(!startup.example);
  const today = toIsoDate(startup.today);
  const hasMedicines = plan.medicines.length > 0;

  const loadExample = () => {
    if (!catalog) return;
    withViewTransition(() =>
      dispatch({ type: 'replace', state: buildExamplePlan(catalog, today, newId) }),
    );
  };

  // Demo links (?example, ?counsel) wait for the drug list, then fill the chart once.
  useEffect(() => {
    if (demoDone.current || !catalog) return;
    demoDone.current = true;
    if (plan.medicines.length === 0) {
      dispatch({ type: 'replace', state: buildExamplePlan(catalog, today, newId) });
    }
  }, [catalog, plan.medicines.length, dispatch, today]);

  return (
    <div className={styles.app}>
      <header className={`${styles.topbar} no-print`}>
        <div className={styles.brand}>
          <Wordmark />
          <div>
            <h1>{strings.app.name}</h1>
            <p className={styles.tagline}>{strings.app.tagline}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <Button icon="counsel" disabled={!hasMedicines} onClick={() => setCounseling(true)}>
            {strings.app.counsel}
          </Button>
          <Button
            variant="primary"
            icon="print"
            disabled={!hasMedicines}
            onClick={() => window.print()}
          >
            {strings.app.print}
          </Button>
        </div>
      </header>

      {startup.notice ? (
        <p className={`${styles.notice} no-print`} role="status">
          {startup.notice}
        </p>
      ) : (
        <span />
      )}

      <main className={styles.layout}>
        <div className={`${styles.work} no-print`}>
          <section aria-label={strings.patient.heading}>
            <TextField
              label={strings.patient.nameLabel}
              hint={strings.patient.nameHint}
              value={plan.patientName}
              maxLength={120}
              autoComplete="off"
              onChange={(event) => dispatch({ type: 'setPatientName', name: event.target.value })}
            />
          </section>
          <MedicinePanel />
          <SafetyNotes />
          <StorageControls
            remember={persistence.remember}
            available={persistence.available}
            today={today}
            onRememberChange={persistence.setRemember}
          />
        </div>
        <div className={styles.preview}>
          <ChartSheet today={startup.today} onExample={loadExample} />
        </div>
      </main>

      <footer className={`${styles.footer} no-print`}>
        <p>{strings.app.privacy}</p>
        <p>{strings.app.dataNote}</p>
        <p>
          <a href={REPO_URL}>{strings.app.repo}</a>
        </p>
      </footer>

      {counseling && hasMedicines && (
        <Suspense fallback={null}>
          <CounselingMode onClose={() => setCounseling(false)} />
        </Suspense>
      )}
    </div>
  );
}
