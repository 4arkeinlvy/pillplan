import { LANGS, useI18n } from '@/shared/i18n';
import { withViewTransition } from '@/shared/viewTransition';
import styles from './LanguageSwitch.module.css';

/** EN | ID. The whole page, the chart and the print change language together. */
export function LanguageSwitch() {
  const { t, lang, setLang } = useI18n();
  return (
    <div className={styles.switch} role="group" aria-label={t.language.label}>
      {LANGS.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          className={styles.option}
          aria-pressed={lang === option}
          title={t.language[option]}
          onClick={() => withViewTransition(() => setLang(option))}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
