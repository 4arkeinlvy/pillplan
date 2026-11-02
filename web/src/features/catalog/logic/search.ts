import type { Drug } from '../model';

export interface SearchHit {
  drug: Drug;
  /** Brand name that matched, when the generic name did not. */
  brand: string | null;
}

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function words(text: string): string[] {
  return normalize(text)
    .split(/[\s()+,]+/)
    .filter(Boolean);
}

function score(drug: Drug, query: string): { score: number; brand: string | null } {
  const name = normalize(drug.name);
  if (name.startsWith(query)) return { score: 4, brand: null };
  if (words(drug.name).some((word) => word.startsWith(query))) return { score: 3, brand: null };
  const brand = drug.brands.find((item) => normalize(item).startsWith(query));
  if (brand) return { score: 2, brand };
  if (name.includes(query)) return { score: 1, brand: null };
  return { score: 0, brand: null };
}

/** Prefix matches on the generic name first, then brand names, then anywhere in the name. */
export function searchDrugs(drugs: readonly Drug[], query: string, limit = 8): SearchHit[] {
  const needle = normalize(query);
  if (!needle) return [];
  return drugs
    .map((drug) => ({ drug, ...score(drug, needle) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.drug.name.localeCompare(b.drug.name))
    .slice(0, limit)
    .map(({ drug, brand }) => ({ drug, brand }));
}
