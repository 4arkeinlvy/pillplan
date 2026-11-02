/** Public API of the medicines feature: the patient's plan and how it is edited. */
export {
  dosesPerDay,
  PILL_COLORS,
  PILL_SHAPES,
  type Medicine,
  type PillLook,
  type PillShape,
  type PlanState,
  type Tracker,
} from './model';
export { emptyPlan, planReducer, type PlanAction } from './logic/reducer';
export { customMedicine, medicineFromDrug, medicineFromMyDrug } from './logic/fromDrug';
export { buildExamplePlan } from './logic/example';
export { displayAdvice, displayStrength, medicineWarnings } from './logic/display';
export { parseSigna, type SignaResult } from './logic/signa';
export { PlanProvider, usePlan } from './ui/PlanProvider';
export { PillPreview } from './ui/PillPreview';
export { MedicinePanel } from './ui/MedicinePanel';
export { scheduleSummary } from './ui/MedicineRow';
