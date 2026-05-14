import Link from 'next/link';
import { topicHref, isLive } from '@/topics';

/**
 * Single topic card. Used by both the home page's "Where to Go Next" grid
 * and the /topics browse page.
 *
 * Props:
 *   topic: Topic — see Topic typedef in src/topics.js
 *   index?: number — when provided, shows a 2-digit ordinal in the head (Home only)
 */
export function TopicCard({ topic, index }) {
  const live = isLive(topic);
  const numLabel = index !== undefined ? String(index + 1).padStart(2, '0') : null;

  const inner = (
    <>
      {(numLabel || !live) && (
        <div className="home-nav-card-head">
          {numLabel && <span className="home-nav-num">{numLabel}</span>}
          {!live && <span className="home-nav-badge">Coming Soon</span>}
        </div>
      )}
      <h3>{topic.title}</h3>
      <p>{topic.summary}</p>
      <span className="home-nav-meta">
        {topic.subject} · {topic.categories.join(', ')}
      </span>
      {live && <span className="home-nav-cta">Open →</span>}
    </>
  );

  return live ? (
    <Link className="home-nav-card" href={topicHref(topic)}>
      {inner}
    </Link>
  ) : (
    <div
      className="home-nav-card home-nav-card--planned"
      aria-disabled="true"
    >
      {inner}
    </div>
  );
}
