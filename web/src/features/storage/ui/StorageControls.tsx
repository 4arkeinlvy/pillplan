import { useRef, useState } from 'react';
import { emptyPlan, usePlan } from '@/features/medicines';
import { strings } from '@/shared/strings';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Switch } from '@/shared/ui/Field';
import { useToast } from '@/shared/ui/Toast';
import { downloadBlob, exportFileName, exportPlan, importPlan } from '../logic/file';
import styles from './StorageControls.module.css';

interface StorageControlsProps {
  remember: boolean;
  available: boolean;
  today: string;
  onRememberChange: (remember: boolean) => void;
}

export function StorageControls({
  remember,
  available,
  today,
  onRememberChange,
}: StorageControlsProps) {
  const { plan, dispatch } = usePlan();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const result = importPlan(await file.text());
    if (result.ok) {
      dispatch({ type: 'replace', state: result.plan });
      toast(strings.storage.imported);
    } else {
      toast(strings.storage.importFailed);
    }
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <section className={`${styles.section} no-print`} aria-labelledby="storage-heading">
      <h2 id="storage-heading" className={styles.heading}>
        {strings.storage.heading}
      </h2>
      {available ? (
        <div>
          <Switch label={strings.storage.remember} checked={remember} onChange={onRememberChange} />
          <p className={styles.hint}>{strings.storage.rememberHint}</p>
        </div>
      ) : (
        <p className={styles.hint}>{strings.storage.unavailable}</p>
      )}
      <div className={styles.buttons}>
        <Button
          icon="download"
          onClick={() => {
            const now = new Date();
            downloadBlob(exportPlan(plan, now), exportFileName(now));
          }}
        >
          {strings.storage.export}
        </Button>
        <Button icon="upload" onClick={() => fileInput.current?.click()}>
          {strings.storage.import}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          aria-label={strings.storage.import}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <Button variant="danger" icon="remove" onClick={() => setConfirming(true)}>
          {strings.storage.clear}
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title={strings.storage.clearTitle}
        body={strings.storage.clearBody}
        confirmLabel={strings.storage.clearConfirm}
        cancelLabel={strings.form.cancel}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          dispatch({ type: 'replace', state: emptyPlan(today) });
          setConfirming(false);
          toast(strings.storage.cleared);
        }}
      />
    </section>
  );
}
