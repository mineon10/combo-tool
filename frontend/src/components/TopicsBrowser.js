'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { TOPICS } from '@/topics';
import { TopicCard } from '@/components/TopicCard';

const FUSE_OPTIONS = {
  // Match against all the user-facing text fields
  keys: [
    { name: 'title', weight: 3 },
    { name: 'tags', weight: 2 },
    { name: 'categories', weight: 2 },
    { name: 'subject', weight: 1 },
    { name: 'summary', weight: 1 },
  ],
  threshold: 0.4,         // 0 = exact, 1 = match anything
  ignoreLocation: true,   // don't penalize matches at end of string
  minMatchCharLength: 2,
};

export function TopicsBrowser() {
  const [query, setQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [showOnlyLive, setShowOnlyLive] = useState(false);

  const fuse = useMemo(() => new Fuse(TOPICS, FUSE_OPTIONS), []);

  // Collect all unique categories from the registry
  const allCategories = useMemo(() => {
    const set = new Set();
    TOPICS.forEach((t) => t.categories.forEach((c) => set.add(c)));
    return [...set].sort();
  }, []);

  const filtered = useMemo(() => {
    let result = query.trim()
      ? fuse.search(query).map((r) => r.item)
      : TOPICS;

    if (activeCategories.length > 0) {
      result = result.filter((t) =>
        t.categories.some((c) => activeCategories.includes(c))
      );
    }

    if (showOnlyLive) {
      result = result.filter((t) => t.status !== 'planned');
    }

    return result;
  }, [query, activeCategories, showOnlyLive, fuse]);

  const toggleCategory = (cat) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const hasActiveFilters =
    query.trim() !== '' || activeCategories.length > 0 || showOnlyLive;

  const clearFilters = () => {
    setQuery('');
    setActiveCategories([]);
    setShowOnlyLive(false);
  };

  return (
    <div className="topics-page">
      <div className="topics-container">
        <header className="topics-header">
          <div className="home-eyebrow">Browse Topics</div>
          <h1 className="topics-title">All Visualizations</h1>
          <p className="topics-subtitle">
            Search by name, tag, or category. {TOPICS.length} topics available
            ({TOPICS.filter((t) => t.status !== 'planned').length} live).
          </p>
        </header>

        <div className="topics-controls">
          <div className="topics-search-wrap">
            <svg
              className="topics-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className="topics-search"
              placeholder="Search topics, tags, or categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                type="button"
                className="topics-search-clear"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="topics-filters">
            <span className="topics-filter-label">Categories</span>
            {allCategories.map((cat) => {
              const active = activeCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  className={`topics-chip${active ? ' topics-chip--active' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="topics-filters">
            <span className="topics-filter-label">Status</span>
            <button
              type="button"
              className={`topics-chip${showOnlyLive ? ' topics-chip--active' : ''}`}
              onClick={() => setShowOnlyLive((v) => !v)}
            >
              Live only
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                className="topics-chip topics-chip--clear"
                onClick={clearFilters}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="topics-count">
          Showing <strong>{filtered.length}</strong> of {TOPICS.length}
        </div>

        {filtered.length === 0 ? (
          <div className="topics-empty">
            <p className="topics-empty-title">No topics match your filters.</p>
            <button type="button" className="topics-empty-clear" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="home-nav-grid">
            {filtered.map((topic) => (
              <TopicCard key={topic.slug} topic={topic} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
