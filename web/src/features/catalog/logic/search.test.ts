import { describe, expect, it } from 'vitest';
import { testCatalog } from '@/test/catalog';
import { normalize, searchDrugs } from './search';

const names = (query: string) => searchDrugs(testCatalog.drugs, query).map((hit) => hit.drug.id);

describe('searchDrugs', () => {
  it('finds a drug by the start of its generic name', () => {
    expect(names('metf')).toEqual(['metformin']);
  });

  it('finds a drug by brand name and reports the brand', () => {
    const [hit] = searchDrugs(testCatalog.drugs, 'lipit');
    expect(hit?.drug.id).toBe('atorvastatin');
    expect(hit?.brand).toBe('Lipitor');
  });

  it('matches words inside the name, such as acetaminophen', () => {
    expect(names('acetamin')).toContain('paracetamol');
  });

  it('ranks the whole-name prefix first', () => {
    expect(names('para')[0]).toBe('paracetamol');
  });

  it('ignores case, spaces and accents', () => {
    expect(normalize('  Paracétamol ')).toBe('paracetamol');
    expect(names('SIMVA')).toEqual(['simvastatin']);
  });

  it('returns nothing for an empty query', () => {
    expect(names('   ')).toEqual([]);
  });
});
