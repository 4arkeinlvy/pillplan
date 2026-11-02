import { useRef, useState, type FormEvent } from 'react';
import { useCatalog } from '@/features/catalog';
import {
  amountStep,
  DOSE_FORMS,
  FOOD_RULES,
  TIME_SLOTS,
  type TimeSlot,
} from '@/shared/domain/time';
import { formatStrength } from '@/shared/format/dose';
import { strings } from '@/shared/strings';
import { Button } from '@/shared/ui/Button';
import { ChoiceGroup, MultiChoiceGroup, Stepper, TextArea, TextField } from '@/shared/ui/Field';
import { Icon, isIconName } from '@/shared/ui/Icon';
import { DEFAULT_PRN_MAX, withStrength } from '../logic/fromDrug';
import { validateMedicine, type MedicineErrors } from '../logic/validate';
import { PILL_COLORS, PILL_SHAPES, type Medicine } from '../model';
import { PillPreview } from './PillPreview';
import styles from './MedicineForm.module.css';

type When = TimeSlot | 'prn';

interface MedicineFormProps {
  initial: Medicine;
  mode: 'add' | 'edit';
  onSubmit: (medicine: Medicine) => void;
  onCancel: () => void;
}

export function MedicineForm({ initial, mode, onSubmit, onCancel }: MedicineFormProps) {
  const catalog = useCatalog();
  const formRef = useRef<HTMLFormElement>(null);
  const [medicine, setMedicine] = useState(initial);
  const [errors, setErrors] = useState<MedicineErrors>({});
  const drug = medicine.drugId ? catalog?.drugById.get(medicine.drugId) : undefined;
  const set = (patch: Partial<Medicine>) => setMedicine((current) => ({ ...current, ...patch }));

  const strengthIndex = drug
    ? Math.max(
        0,
        drug.strengths.findIndex((s) => formatStrength(s, drug.unit) === medicine.strength),
      )
    : 0;

  const when: When[] = medicine.prn ? ['prn'] : medicine.times;
  const changeWhen = (next: When[]) => {
    const addedPrn = next.includes('prn') && !medicine.prn;
    if (addedPrn) {
      set({ prn: true, times: [], prnMaxPerDay: medicine.prnMaxPerDay ?? DEFAULT_PRN_MAX });
    } else {
      const times = TIME_SLOTS.filter((slot) => next.includes(slot));
      set({ prn: false, times });
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateMedicine(medicine);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      window.setTimeout(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }
    onSubmit({ ...medicine, name: medicine.name.trim(), purpose: medicine.purpose.trim() });
  };

  const heading =
    mode === 'add'
      ? strings.form.addHeading(medicine.name)
      : strings.form.editHeading(medicine.name);

  return (
    <form ref={formRef} className={styles.form} onSubmit={submit} noValidate aria-label={heading}>
      <h3 className={styles.title}>
        <PillPreview pill={medicine.pill} />
        <span>
          {heading}
          {medicine.strength && <span className={styles.strength}> {medicine.strength}</span>}
        </span>
      </h3>
      {!medicine.drugId && <p className={styles.unchecked}>{strings.search.customNote}</p>}

      {!medicine.drugId && (
        <div className={styles.row}>
          <TextField
            label={strings.form.name}
            value={medicine.name}
            error={errors.name}
            onChange={(event) => set({ name: event.target.value })}
          />
          <TextField
            label={strings.form.strength}
            hint={strings.form.strengthCustomHint}
            value={medicine.strength}
            onChange={(event) => set({ strength: event.target.value })}
          />
        </div>
      )}

      {drug && drug.strengths.length > 1 && (
        <ChoiceGroup
          legend={strings.form.strength}
          value={String(strengthIndex)}
          choices={drug.strengths.map((s, index) => ({
            value: String(index),
            label: formatStrength(s, drug.unit),
          }))}
          onChange={(value) => setMedicine((current) => withStrength(current, drug, Number(value)))}
        />
      )}

      {!medicine.drugId && (
        <ChoiceGroup
          legend={strings.form.form}
          value={medicine.form}
          choices={DOSE_FORMS.map((form) => ({ value: form, label: strings.form.forms[form] }))}
          onChange={(form) => set({ form })}
        />
      )}

      <Stepper
        label={strings.form.amount}
        value={medicine.amount}
        step={amountStep(medicine.form)}
        min={amountStep(medicine.form)}
        max={20}
        lessLabel={strings.form.less}
        moreLabel={strings.form.more}
        suffix={strings.form.forms[medicine.form]}
        error={errors.amount}
        onChange={(amount) => set({ amount })}
      />

      <MultiChoiceGroup
        legend={strings.form.when}
        hint={medicine.prn ? strings.form.whenNeededHint : undefined}
        error={errors.times}
        value={when}
        choices={[
          ...TIME_SLOTS.map((slot) => ({
            value: slot,
            label: strings.slots[slot],
            icon: <Icon name={slot} />,
          })),
          { value: 'prn' as const, label: strings.whenNeeded, icon: <Icon name="prn" /> },
        ]}
        onChange={changeWhen}
      />

      {medicine.prn && (
        <Stepper
          label={strings.form.maxPerDay}
          value={medicine.prnMaxPerDay ?? DEFAULT_PRN_MAX}
          step={1}
          min={1}
          max={24}
          lessLabel={strings.form.less}
          moreLabel={strings.form.more}
          error={errors.maxPerDay}
          onChange={(prnMaxPerDay) => set({ prnMaxPerDay })}
        />
      )}

      <ChoiceGroup
        legend={strings.form.food}
        value={medicine.food}
        choices={FOOD_RULES.map((rule) => ({ value: rule, label: strings.food[rule] }))}
        onChange={(food) => set({ food })}
      />

      {catalog && (
        <MultiChoiceGroup
          legend={strings.form.warnings}
          value={medicine.warnings}
          choices={catalog.warnings.map((warning) => ({
            value: warning.id,
            label: warning.short,
            icon: isIconName(warning.icon) ? <Icon name={warning.icon} /> : undefined,
          }))}
          onChange={(warnings) => set({ warnings })}
        />
      )}

      <TextField
        label={strings.form.purpose}
        hint={strings.form.purposeHint}
        value={medicine.purpose}
        maxLength={120}
        onChange={(event) => set({ purpose: event.target.value })}
      />

      <TextArea
        label={strings.form.advice}
        value={medicine.advice}
        maxLength={400}
        rows={2}
        onChange={(event) => set({ advice: event.target.value })}
      />

      <fieldset className={styles.look}>
        <legend className="visually-hidden">{strings.form.pillLook}</legend>
        <div className={styles.row}>
          <ChoiceGroup
            legend={strings.form.shape}
            value={medicine.pill.shape}
            choices={PILL_SHAPES.map((shape) => ({
              value: shape,
              label: strings.form.shapes[shape],
            }))}
            onChange={(shape) => set({ pill: { ...medicine.pill, shape } })}
          />
          <ChoiceGroup
            legend={strings.form.color}
            value={medicine.pill.color}
            choices={PILL_COLORS.map((color) => ({
              value: color.hex,
              label: color.name,
              icon: <span className={styles.swatch} style={{ background: color.hex }} />,
            }))}
            onChange={(color) => set({ pill: { ...medicine.pill, color } })}
          />
        </div>
        <PillPreview pill={medicine.pill} size={88} />
      </fieldset>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" icon={mode === 'add' ? 'plus' : 'check'}>
          {mode === 'add' ? strings.form.add : strings.form.save}
        </Button>
        <Button onClick={onCancel}>{strings.form.cancel}</Button>
      </div>
    </form>
  );
}
