import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CatalogProvider, MyDrugsList, useCatalog } from '@/features/catalog';
import { buildExamplePlan, MedicinePanel, PlanProvider, usePlan } from '@/features/medicines';
import { SafetyNotes } from '@/features/safety';
import { ChartSheet, toIsoDate } from '@/features/schedule';
import { StorageControls, usePersistence } from '@/features/storage';
import { newId } from '@/shared/id';
import { I18nProvider, useI18n } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/Field';
import { ToastProvider } from '@/shared/ui/Toast';
import { withViewTransition } from '@/shared/viewTransition';
import type { Catalog } from '@/features/catalog';
import { readStartup, type Startup } from './startup';
import { LanguageSwitch } from './LanguageSwitch';
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
    <I18nProvider initial={startup.lang} storage={startup.storage}>
      <CatalogProvider catalog={catalog} storage={startup.storage}>
        <PlanProvider initial={startup.plan}>
          <ToastProvider>
            <Shell startup={startup} />
          </ToastProvider>
        </PlanProvider>
      </CatalogProvider>
    </I18nProvider>
  );
}

function Shell({ startup }: { startup: Startup }) {
  const { plan, dispatch } = usePlan();
  const catalog = useCatalog();
  const { t, lang } = useI18n();
  const searchRef = useRef<HTMLInputElement>(null);
  const [highlight, setHighlight] = useState<readonly string[]>([]);
  const persistence = usePersistence(plan, startup.storage);
  const [counseling, setCounseling] = useState(startup.counsel);
  const demoDone = useRef(!startup.example);
  const today = toIsoDate(startup.today);
  const hasMedicines = plan.medicines.length > 0;

  const loadExample = () => {
    if (!catalog) return;
    withViewTransition(() =>
      dispatch({ type: 'replace', state: buildExamplePlan(catalog, today, newId, t, lang) }),
    );
  };

  // Demo links (?example, ?counsel) wait for the drug list, then fill the chart once.
  useEffect(() => {
    if (demoDone.current || !catalog) return;
    demoDone.current = true;
    if (plan.medicines.length === 0) {
      dispatch({ type: 'replace', state: buildExamplePlan(catalog, today, newId, t, lang) });
    }
  }, [catalog, plan.medicines.length, dispatch, today, t, lang]);

  // "/" jumps to the drug search, like many search boxes.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, select, [contenteditable]');
      if (event.key === '/' && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={styles.app}>
      <header className={`${styles.topbar} no-print`}>
        <div className={styles.brand}>
          <Wordmark />
          <div>
            <h1>{t.app.name}</h1>
            <p className={styles.tagline}>{t.app.tagline}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <LanguageSwitch />
          <Button icon="counsel" disabled={!hasMedicines} onClick={() => setCounseling(true)}>
            {t.app.counsel}
          </Button>
          <Button
            variant="primary"
            icon="print"
            disabled={!hasMedicines}
            onClick={() => window.print()}
          >
            {t.app.print}
          </Button>
        </div>
      </header>

      {startup.invalidSaved ? (
        <p className={`${styles.notice} no-print`} role="status">
          {t.storage.invalidSaved}
        </p>
      ) : (
        <span />
      )}

      <main className={styles.layout}>
        <div className={`${styles.work} no-print`}>
          <section aria-label={t.patient.heading}>
            <TextField
              label={t.patient.nameLabel}
              hint={t.patient.nameHint}
              value={plan.patientName}
              maxLength={120}
              autoComplete="off"
              onChange={(event) => dispatch({ type: 'setPatientName', name: event.target.value })}
            />
          </section>
          <MedicinePanel searchRef={searchRef} />
          <SafetyNotes onHighlight={setHighlight} />
          <MyDrugsList />
          <StorageControls
            remember={persistence.remember}
            available={persistence.available}
            today={today}
            onRememberChange={persistence.setRemember}
          />
        </div>
        <div className={styles.preview}>
          <ChartSheet today={startup.today} onExample={loadExample} highlight={highlight} />
        </div>
      </main>

      <footer className={`${styles.footer} no-print`}>
        <p>{t.app.privacy}</p>
        <p>{t.app.dataNote}</p>
        <p>
          <a href={REPO_URL}>{t.app.repo}</a>
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
