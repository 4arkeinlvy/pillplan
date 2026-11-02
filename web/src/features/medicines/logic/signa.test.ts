import { describe, expect, it } from 'vitest';
import { isEmptySigna, parseSigna } from './signa';

describe('parseSigna: Latin signa', () => {
  it.each([
    ['S 3 dd 1 tab p.c.', ['morning', 'noon', 'evening'], 1, 'with_after'],
    ['3 dd 1 pc', ['morning', 'noon', 'evening'], 1, 'with_after'],
    ['S 2 dd I a.c.', ['morning', 'evening'], 1, 'before'],
    ['2 dd 1/2 tab', ['morning', 'evening'], 0.5, null],
    ['1 dd ½ tab', ['morning'], 0.5, null],
    ['4 dd 1 caps', ['morning', 'noon', 'evening', 'bedtime'], 1, null],
    ['1 dd 1 h.s.', ['bedtime'], 1, null],
    ['1 dd 1 o.m. a.c.', ['morning'], 1, 'before'],
    ['1 dd 1 o.n.', ['evening'], 1, null],
    ['2 dd II d.c.', ['morning', 'evening'], 2, 'with_after'],
    ['3dd1', ['morning', 'noon', 'evening'], 1, null],
    ['t.i.d. 1 tab', ['morning', 'noon', 'evening'], 1, null],
    ['b.i.d.', ['morning', 'evening'], null, null],
    ['q.i.d. 2 tab', ['morning', 'noon', 'evening', 'bedtime'], 2, null],
    ['q8h 1 caps p.c.', ['morning', 'noon', 'evening'], 1, 'with_after'],
  ] as const)('%s', (signa, times, amount, food) => {
    const result = parseSigna(signa);
    expect(result.times).toEqual(times);
    expect(result.amount).toBe(amount);
    expect(result.food).toBe(food);
    expect(result.prn).toBe(false);
    expect(result.unknown).toEqual([]);
  });
});

describe('parseSigna: Indonesian', () => {
  it.each([
    ['3 x 1 sesudah makan', ['morning', 'noon', 'evening'], 1, 'with_after'],
    ['2x1 sebelum makan', ['morning', 'evening'], 1, 'before'],
    ['3 kali sehari 1 tablet setelah makan', ['morning', 'noon', 'evening'], 1, 'with_after'],
    ['2 x sehari 1 tablet', ['morning', 'evening'], 1, null],
    ['tiap 8 jam 1 tab', ['morning', 'noon', 'evening'], 1, null],
    ['tiap 12 jam 1 kapsul', ['morning', 'evening'], 1, null],
    ['1 x 1 malam', ['evening'], 1, null],
    ['1x1 sebelum tidur', ['bedtime'], 1, null],
    ['pagi dan malam 1 tablet', ['morning', 'evening'], 1, null],
  ] as const)('%s', (signa, times, amount, food) => {
    const result = parseSigna(signa);
    expect(result.times).toEqual(times);
    expect(result.amount).toBe(amount);
    expect(result.food).toBe(food);
    expect(result.unknown).toEqual([]);
  });
});

describe('parseSigna: when needed', () => {
  it('reads p.r.n. with an amount', () => {
    expect(parseSigna('p.r.n. 1 tab')).toMatchObject({
      prn: true,
      times: [],
      amount: 1,
      maxPerDay: null,
    });
  });

  it('turns a frequency into the daily limit', () => {
    expect(parseSigna('3 dd 1 prn')).toMatchObject({
      prn: true,
      times: [],
      maxPerDay: 3,
      amount: 1,
    });
  });

  it('understands Indonesian and s.o.s.', () => {
    expect(parseSigna('bila perlu 2 tablet').prn).toBe(true);
    expect(parseSigna('k/p 1 tab').prn).toBe(true);
    expect(parseSigna('s.o.s. 1 tab')).toMatchObject({ prn: true, amount: 1 });
  });
});

describe('parseSigna: liquids and drops', () => {
  it('converts teaspoons and tablespoons to mL', () => {
    expect(parseSigna('3 dd 1 cth')).toMatchObject({ form: 'mL', amount: 5 });
    expect(parseSigna('2 dd 1 C')).toMatchObject({ form: 'mL', amount: 15 });
  });

  it('reads drops', () => {
    expect(parseSigna('3 dd 2 gtt')).toMatchObject({ form: 'drop', amount: 2 });
  });
});

describe('parseSigna: defaults and errors', () => {
  it('keeps the drug default slot when the count matches', () => {
    expect(parseSigna('1 dd 1', ['bedtime']).times).toEqual(['bedtime']);
    expect(parseSigna('2 dd 1', ['bedtime']).times).toEqual(['morning', 'evening']);
  });

  it('reports words it does not understand', () => {
    expect(parseSigna('3 dd 1 tab p.c. xyz').unknown).toEqual(['xyz']);
  });

  it('flags more than four doses a day instead of guessing', () => {
    const result = parseSigna('tiap 4 jam 1 tab');
    expect(result.count).toBe(6);
    expect(result.times).toBeNull();
    expect(result.unknown).toEqual(['6 x']);
  });

  it('knows when nothing is understood yet', () => {
    expect(isEmptySigna(parseSigna(''))).toBe(true);
    expect(isEmptySigna(parseSigna('3'))).toBe(true);
    expect(isEmptySigna(parseSigna('3 dd'))).toBe(false);
  });

  it('accepts a decimal comma', () => {
    expect(parseSigna('1 dd 0,5 tab').amount).toBe(0.5);
  });
});
