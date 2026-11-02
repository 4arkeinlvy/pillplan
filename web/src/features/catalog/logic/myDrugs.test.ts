import { beforeEach, describe, expect, it } from 'vitest';
import type { MyDrug } from '../model';
import { loadMyDrugs, MY_DRUGS_KEY, saveMyDrugs, upsertMyDrug } from './myDrugs';

const drug = (id: string, name: string): MyDrug => ({
  id,
  name,
  strength: '10 mg',
  form: 'tablet',
  times: ['morning'],
  prn: false,
  prnMaxPerDay: null,
  food: 'any',
  warnings: [],
  advice: '',
});

describe('my drugs', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips through storage', () => {
    saveMyDrugs(window.localStorage, [drug('a', 'Jamu kunyit')]);
    expect(loadMyDrugs(window.localStorage)).toEqual([drug('a', 'Jamu kunyit')]);
  });

  it('ignores broken data', () => {
    window.localStorage.setItem(MY_DRUGS_KEY, '[{"id":"x"}]');
    expect(loadMyDrugs(window.localStorage)).toEqual([]);
    window.localStorage.setItem(MY_DRUGS_KEY, 'nope');
    expect(loadMyDrugs(window.localStorage)).toEqual([]);
    expect(loadMyDrugs(null)).toEqual([]);
  });

  it('replaces a drug with the same name instead of adding a duplicate', () => {
    const list = upsertMyDrug(
      [drug('a', 'Jamu kunyit'), drug('b', 'Other')],
      drug('c', 'jamu KUNYIT'),
    );
    expect(list.map((item) => item.id)).toEqual(['c', 'b']);
  });
});
