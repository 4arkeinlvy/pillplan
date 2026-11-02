import * as v from 'valibot';
import { PILL_SHAPES, type PlanState } from '@/features/medicines';
import { DOSE_FORMS, DOSE_UNITS, FOOD_RULES, TIME_SLOTS } from '@/shared/domain/time';

export const FILE_VERSION = 1;

const text = (max: number) => v.pipe(v.string(), v.maxLength(max));

const MedicineSchema = v.object({
  id: v.pipe(v.string(), v.regex(/^[A-Za-z0-9_-]{1,64}$/)),
  drugId: v.nullable(v.pipe(v.string(), v.regex(/^[a-z][a-z0-9_]*$/))),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(120)),
  strength: text(80),
  ingredientAmounts: v.pipe(v.array(v.pipe(v.number(), v.minValue(0))), v.maxLength(10)),
  unit: v.nullable(v.picklist(DOSE_UNITS)),
  amount: v.pipe(v.number(), v.minValue(0.25), v.maxValue(100)),
  form: v.picklist(DOSE_FORMS),
  times: v.pipe(v.array(v.picklist(TIME_SLOTS)), v.maxLength(4)),
  prn: v.boolean(),
  prnMaxPerDay: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(24))),
  food: v.picklist(FOOD_RULES),
  warnings: v.pipe(v.array(text(40)), v.maxLength(20)),
  purpose: text(120),
  advice: text(400),
  pill: v.object({
    shape: v.picklist(PILL_SHAPES),
    // Only plain hex colors, because the color ends up in an SVG fill.
    color: v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/)),
  }),
});

export const PlanSchema = v.object({
  patientName: text(120),
  medicines: v.pipe(v.array(MedicineSchema), v.maxLength(50)),
  tracker: v.object({
    start: v.pipe(v.string(), v.isoDate()),
    popped: v.pipe(v.array(v.pipe(v.string(), v.regex(/^d[0-6]-[a-z]+$/))), v.maxLength(28)),
  }),
});

/** The same envelope is used for browser storage and for exported files. */
export const SavedPlanSchema = v.object({
  app: v.literal('pillplan'),
  version: v.literal(FILE_VERSION),
  savedAt: v.string(),
  plan: PlanSchema,
});

export function parsePlan(value: unknown): PlanState | null {
  const result = v.safeParse(SavedPlanSchema, value);
  return result.success ? result.output.plan : null;
}

export function serializePlan(plan: PlanState, now: Date): string {
  return JSON.stringify({
    app: 'pillplan',
    version: FILE_VERSION,
    savedAt: now.toISOString(),
    plan,
  });
}
