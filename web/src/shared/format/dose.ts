import type { DoseForm, DoseUnit } from '@/shared/domain/time';

const FRACTIONS: Readonly<Record<string, string>> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };

const FORM_NAMES: Readonly<Record<DoseForm, readonly [string, string]>> = {
  tablet: ['tablet', 'tablets'],
  capsule: ['capsule', 'capsules'],
  mL: ['mL', 'mL'],
  puff: ['puff', 'puffs'],
  drop: ['drop', 'drops'],
};

/**
 * ISMP style numbers: always a leading zero, never a trailing zero,
 * commas from 1,000 up. 0.5 -> "0.5", 1 -> "1", 4000 -> "4,000".
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '';
  return value.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

/** Solid doses read better as fractions: 0.5 -> "½", 1.5 -> "1½". */
export function formatAmount(amount: number, form: DoseForm): string {
  if (form === 'tablet' || form === 'capsule') {
    const whole = Math.floor(amount);
    const fraction = FRACTIONS[String(Math.round((amount - whole) * 100) / 100)];
    if (fraction) return whole === 0 ? fraction : `${whole}${fraction}`;
  }
  return formatNumber(amount);
}

export function formName(amount: number, form: DoseForm): string {
  const [one, many] = FORM_NAMES[form];
  return amount > 1 ? many : one;
}

/** "1 tablet", "½ tablet", "2 capsules", "5 mL". */
export function formatDose(amount: number, form: DoseForm): string {
  return `${formatAmount(amount, form)} ${formName(amount, form)}`;
}

/** "500 mg" or, for combinations, "500 mg + 65 mg". */
export function formatStrength(amounts: readonly number[], unit: DoseUnit): string {
  return amounts.map((amount) => `${formatNumber(amount)} ${unit}`).join(' + ');
}
