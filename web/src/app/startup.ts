import { emptyPlan, type PlanState } from '@/features/medicines';
import { toIsoDate } from '@/features/schedule';
import { getStorage, loadPlan } from '@/features/storage';
import { strings } from '@/shared/strings';

export interface Startup {
  today: Date;
  storage: Storage | null;
  plan: PlanState;
  notice: string | null;
  /** ?example loads the made-up patient; ?counsel also opens counseling mode (for demos). */
  example: boolean;
  counsel: boolean;
}

/** Read everything the app needs once, before the first render. */
export function readStartup(now = new Date(), search = window.location.search): Startup {
  const storage = getStorage();
  const saved = loadPlan(storage);
  const params = new URLSearchParams(search);
  return {
    today: now,
    storage,
    plan: saved.status === 'restored' ? saved.plan : emptyPlan(toIsoDate(now)),
    notice: saved.status === 'invalid' ? strings.storage.invalidSaved : null,
    example: params.has('example') || params.has('counsel'),
    counsel: params.has('counsel'),
  };
}
