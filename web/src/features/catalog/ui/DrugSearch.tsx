import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { formatStrength } from '@/shared/format/dose';
import { Icon } from '@/shared/ui/Icon';
import { strings } from '@/shared/strings';
import { searchDrugs } from '../logic/search';
import type { Drug } from '../model';
import { useCatalog } from './CatalogProvider';
import styles from './DrugSearch.module.css';

interface DrugSearchProps {
  onPick: (drug: Drug) => void;
  onCustom: (name: string) => void;
}

/** Combobox (ARIA 1.2 pattern): type, move with arrow keys, Enter to choose. */
export function DrugSearch({ onPick, onCustom }: DrugSearchProps) {
  const catalog = useCatalog();
  const id = useId();
  const listId = `${id}-list`;
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const hits = useMemo(() => (catalog ? searchDrugs(catalog.drugs, query) : []), [catalog, query]);
  const trimmed = query.trim();
  const optionCount = hits.length + (trimmed ? 1 : 0);
  const expanded = open && optionCount > 0;
  const optionId = (index: number) => `${id}-option-${index}`;

  const choose = (index: number) => {
    const hit = hits[index];
    if (hit) onPick(hit.drug);
    else if (trimmed) onCustom(trimmed);
    else return;
    setQuery('');
    setOpen(false);
    setActive(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current + 1) % Math.max(optionCount, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => (current - 1 + optionCount) % Math.max(optionCount, 1));
    } else if (event.key === 'Enter' && expanded) {
      event.preventDefault();
      choose(active);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={styles.search}>
      <label className={styles.label} htmlFor={id}>
        {strings.search.label}
      </label>
      <div className={styles.inputWrap}>
        <Icon name="search" />
        <input
          id={id}
          className={styles.input}
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded ? optionId(active) : undefined}
          aria-describedby={`${id}-hint`}
          placeholder={catalog ? strings.search.placeholder : strings.search.loading}
          disabled={!catalog}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
        />
        <ul
          id={listId}
          role="listbox"
          aria-label={strings.search.listLabel}
          className={styles.list}
          hidden={!expanded}
        >
          {hits.map(({ drug, brand }, index) => (
            <li
              key={drug.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === active}
              className={styles.option}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span className={styles.name}>
                {drug.name}
                {brand && ` (${brand})`}
              </span>
              <span className={styles.meta}>
                {drug.drugClass}.{' '}
                {strings.search.strengths(drug.strengths.map((s) => formatStrength(s, drug.unit)))}
              </span>
            </li>
          ))}
          {trimmed && (
            <li
              id={optionId(hits.length)}
              role="option"
              aria-selected={active === hits.length}
              className={`${styles.option} ${styles.custom}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(hits.length)}
            >
              {strings.search.addCustom(trimmed)}
              <span className={styles.meta}>{strings.search.customNote}</span>
            </li>
          )}
        </ul>
      </div>
      <p id={`${id}-hint`} className={styles.hint}>
        {strings.search.hint}
      </p>
      <p className="visually-hidden" aria-live="polite">
        {expanded ? strings.search.matches(hits.length) : ''}
      </p>
    </div>
  );
}
