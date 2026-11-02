/** Public API of the catalog feature. Other features import only from here. */
export type { Catalog, CatalogData, Drug, Ingredient, WarningLabel } from './model';
export { createCatalog, loadCatalog } from './logic/catalog';
export { searchDrugs, type SearchHit } from './logic/search';
export { CatalogProvider, useCatalog } from './ui/CatalogProvider';
export { DrugSearch } from './ui/DrugSearch';
