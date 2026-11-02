import type { PillLook } from '../model';

interface PillPreviewProps {
  pill: PillLook;
  size?: number;
}

/** A small drawing of the pill, so patients can match the chart to the box. */
export function PillPreview({ pill, size = 40 }: PillPreviewProps) {
  const stroke = { stroke: 'var(--ink)', strokeWidth: 1.5 };
  return (
    <svg
      width={size}
      height={(size * 24) / 40}
      viewBox="0 0 40 24"
      aria-hidden="true"
      focusable="false"
    >
      {pill.shape === 'round' && (
        <>
          <circle cx="20" cy="12" r="10" fill={pill.color} {...stroke} />
          <path d="M13 12h14" stroke="var(--ink)" strokeOpacity="0.35" />
        </>
      )}
      {pill.shape === 'oval' && (
        <>
          <ellipse cx="20" cy="12" rx="17" ry="9.5" fill={pill.color} {...stroke} />
          <path d="M9 12h22" stroke="var(--ink)" strokeOpacity="0.35" />
        </>
      )}
      {pill.shape === 'capsule' && (
        <>
          <path d="M20 3H11a9 9 0 0 0 0 18h9Z" fill={pill.color} {...stroke} />
          <path d="M20 3h9a9 9 0 0 1 0 18h-9Z" fill="#fff" {...stroke} />
        </>
      )}
    </svg>
  );
}
