import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadCatalog } from '../logic/catalog';
import type { Catalog } from '../model';

const CatalogContext = createContext<Catalog | null>(null);

interface CatalogProviderProps {
  children: ReactNode;
  /** Tests pass the catalog in directly instead of loading the chunk. */
  catalog?: Catalog;
}

export function CatalogProvider({ children, catalog: given }: CatalogProviderProps) {
  const [loaded, setLoaded] = useState<Catalog | null>(null);

  useEffect(() => {
    if (given) return;
    let active = true;
    void loadCatalog().then((catalog) => {
      if (active) setLoaded(catalog);
    });
    return () => {
      active = false;
    };
  }, [given]);

  return <CatalogContext value={given ?? loaded}>{children}</CatalogContext>;
}

/** The catalog, or null while it is still loading. */
export function useCatalog(): Catalog | null {
  return useContext(CatalogContext);
}
