import { useState } from 'react';
import { DrugSearch } from '@/features/catalog';
import { newId } from '@/shared/id';
import { strings } from '@/shared/strings';
import { useToast } from '@/shared/ui/Toast';
import { withViewTransition } from '@/shared/viewTransition';
import { customMedicine, medicineFromDrug } from '../logic/fromDrug';
import type { Medicine } from '../model';
import { MedicineForm } from './MedicineForm';
import { MedicineList } from './MedicineList';
import { usePlan } from './PlanProvider';
import styles from './MedicinePanel.module.css';

interface Draft {
  medicine: Medicine;
  mode: 'add' | 'edit';
}

/** Search, the add or edit form, and the sortable list of medicines. */
export function MedicinePanel() {
  const { plan, dispatch } = usePlan();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);

  const submit = (medicine: Medicine) => {
    const mode = draft?.mode;
    withViewTransition(() => dispatch({ type: mode === 'edit' ? 'update' : 'add', medicine }));
    setDraft(null);
  };

  const remove = (medicine: Medicine) => {
    const index = plan.medicines.findIndex((m) => m.id === medicine.id);
    withViewTransition(() => dispatch({ type: 'remove', id: medicine.id }));
    if (draft?.medicine.id === medicine.id) setDraft(null);
    toast(strings.list.removed(medicine.name), {
      label: strings.list.undo,
      run: () => withViewTransition(() => dispatch({ type: 'restore', medicine, index })),
    });
  };

  return (
    <div className={styles.panel}>
      <DrugSearch
        onPick={(drug) => setDraft({ medicine: medicineFromDrug(drug, 0, newId()), mode: 'add' })}
        onCustom={(name) => setDraft({ medicine: customMedicine(name, newId()), mode: 'add' })}
      />
      {draft && (
        <MedicineForm
          key={draft.medicine.id}
          initial={draft.medicine}
          mode={draft.mode}
          onSubmit={submit}
          onCancel={() => setDraft(null)}
        />
      )}
      <MedicineList
        medicines={plan.medicines}
        onMove={(from, to) => dispatch({ type: 'move', from, to })}
        onEdit={(medicine) => setDraft({ medicine, mode: 'edit' })}
        onRemove={remove}
      />
    </div>
  );
}
