import type { Catalog, Drug } from '@/features/catalog';
import { dosesPerDay, type Medicine } from '@/features/medicines';
import { formatNumber } from '@/shared/format/dose';
import { strings } from '@/shared/strings';
import type { SafetyNote, Severity } from '../model';

const SEVERITY_ORDER: Record<Severity, number> = { alert: 0, caution: 1, info: 2 };

interface Checked {
  medicine: Medicine;
  drug: Drug;
}

function checkedMedicines(medicines: readonly Medicine[], catalog: Catalog): Checked[] {
  return medicines.flatMap((medicine) => {
    const drug = medicine.drugId ? catalog.drugById.get(medicine.drugId) : undefined;
    return drug ? [{ medicine, drug }] : [];
  });
}

function groupBy<T>(items: readonly T[], keys: (item: T) => readonly string[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    for (const key of new Set(keys(item))) {
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
  }
  return groups;
}

/** Sum each ingredient over every product and compare with its usual daily maximum. */
function maxDailyNotes(items: readonly Checked[], catalog: Catalog): SafetyNote[] {
  const totals = new Map<string, { total: number; medicineIds: string[] }>();
  for (const { medicine, drug } of items) {
    drug.ingredients.forEach((ingredientId, index) => {
      const perUnit = medicine.ingredientAmounts[index] ?? 0;
      const daily = perUnit * medicine.amount * dosesPerDay(medicine);
      const entry = totals.get(ingredientId) ?? { total: 0, medicineIds: [] };
      totals.set(ingredientId, {
        total: entry.total + daily,
        medicineIds: [...entry.medicineIds, medicine.id],
      });
    });
  }
  return [...totals].flatMap(([ingredientId, { total, medicineIds }]) => {
    const ingredient = catalog.ingredientById.get(ingredientId);
    const max = ingredient?.usualMaxDaily;
    if (!ingredient || max == null || total <= max) return [];
    const unit = ingredient.unit;
    return [
      {
        id: `max-daily:${ingredientId}`,
        kind: 'max-daily',
        severity: 'alert',
        medicineIds,
        title: strings.safety.maxDailyTitle(ingredient.name, `${formatNumber(total)} ${unit}`),
        detail: strings.safety.maxDailyDetail(`${formatNumber(max)} ${unit}`),
      },
    ];
  });
}

function duplicateNotes(items: readonly Checked[], catalog: Catalog): SafetyNote[] {
  const notes: SafetyNote[] = [];
  const covered = new Set<string>();

  for (const [ingredientId, group] of groupBy(items, ({ drug }) => drug.ingredients)) {
    if (group.length < 2) continue;
    const name = catalog.ingredientById.get(ingredientId)?.name ?? ingredientId;
    const ids = group.map(({ medicine }) => medicine.id);
    covered.add([...ids].sort().join('|'));
    notes.push({
      id: `duplicate-ingredient:${ingredientId}`,
      kind: 'duplicate-ingredient',
      severity: 'caution',
      medicineIds: ids,
      title: strings.safety.duplicateIngredientTitle(name, group.length),
      detail: strings.safety.duplicateIngredientDetail(
        group.map(({ medicine }) => medicine.name),
        name,
      ),
    });
  }

  for (const [drugClass, group] of groupBy(items, ({ drug }) => [drug.drugClass])) {
    const ids = group.map(({ medicine }) => medicine.id);
    if (group.length < 2 || covered.has([...ids].sort().join('|'))) continue;
    notes.push({
      id: `duplicate-class:${drugClass}`,
      kind: 'duplicate-class',
      severity: 'caution',
      medicineIds: ids,
      title: strings.safety.duplicateClassTitle(drugClass),
      detail: strings.safety.duplicateClassDetail(group.map(({ medicine }) => medicine.name)),
    });
  }
  return notes;
}

function timingNotes(items: readonly Checked[]): SafetyNote[] {
  return items.flatMap(({ medicine, drug }) => {
    const best = drug.bestTimes;
    if (medicine.prn || best.length === 0 || medicine.times.every((t) => best.includes(t))) {
      return [];
    }
    return [
      {
        id: `timing:${medicine.id}`,
        kind: 'timing',
        severity: 'info',
        medicineIds: [medicine.id],
        title: strings.safety.timingTitle(medicine.name),
        detail: drug.advice,
      },
    ];
  });
}

function uncheckedNotes(medicines: readonly Medicine[]): SafetyNote[] {
  return medicines
    .filter((medicine) => medicine.drugId === null)
    .map((medicine) => ({
      id: `unchecked:${medicine.id}`,
      kind: 'unchecked',
      severity: 'info',
      medicineIds: [medicine.id],
      title: strings.safety.uncheckedTitle(medicine.name),
      detail: strings.safety.uncheckedDetail,
    }));
}

/**
 * Checks PillPlan can make with its own data. It never says a plan is safe:
 * no notes only means none of these checks found something.
 */
export function runSafetyChecks(medicines: readonly Medicine[], catalog: Catalog): SafetyNote[] {
  const items = checkedMedicines(medicines, catalog);
  return [
    ...maxDailyNotes(items, catalog),
    ...duplicateNotes(items, catalog),
    ...timingNotes(items),
    ...uncheckedNotes(medicines),
  ].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
