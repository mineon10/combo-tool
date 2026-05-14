'use client';

import { useEffect, useState } from 'react';

/**
 * Centered loading state for visualizer pages.
 *
 * The cold-start hint appears after `hintDelayMs` so fast warm-cache loads
 * don't briefly flash the "30 seconds" message — only loads that actually
 * take a while will show it.
 *
 * Props:
 *   message?: string   — primary line shown immediately (default: "Loading visualization…")
 *   hint?: ReactNode   — secondary line shown after delay (e.g., the cold-start explanation)
 *   hintDelayMs?: number — how long before the hint appears (default 1200ms)
 */
export function PageLoader({
  message = 'Loading visualization…',
  hint = null,
  hintDelayMs = 1200,
}) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setShowHint(true), hintDelayMs);
    return () => clearTimeout(t);
  }, [hint, hintDelayMs]);

  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-spinner" aria-hidden="true" />
      <p className="page-loader-message">{message}</p>
      {hint && (
        <p className={`page-loader-hint${showHint ? ' is-visible' : ''}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
