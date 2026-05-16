'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTabs, tabHref } from './TabsProvider';

export function TabBar() {
  const { openTabs, closeTab, openNew, hydrated } = useTabs();
  const pathname = usePathname();
  const router = useRouter();

  // Avoid SSR/hydration flash — render nothing until storage has been read
  if (!hydrated || openTabs.length === 0) return null;

  // When the same topic has multiple tabs open, give the 2nd+ a number suffix
  // so they're visually distinguishable. The first stays plain.
  const labelFor = (tab, idx) => {
    const sameSlugBefore = openTabs
      .slice(0, idx)
      .filter((t) => t.slug === tab.slug).length;
    return sameSlugBefore === 0
      ? tab.title
      : `${tab.title} ${sameSlugBefore + 1}`;
  };

  const duplicate = (tab) => {
    const newId = openNew(tab.slug);
    if (newId) router.push(`/${tab.slug}/${newId}`);
  };

  return (
    <div className="tab-bar" role="tablist" aria-label="Open topic tabs">
      {openTabs.map((tab, idx) => {
        const href = tabHref(tab);
        const active = pathname === href;
        const label = labelFor(tab, idx);
        return (
          <div
            key={tab.id}
            className={`tab-item${active ? ' tab-item--active' : ''}`}
            role="tab"
            aria-selected={active}
          >
            <Link href={href} className="tab-link">
              {label}
            </Link>
            <button
              type="button"
              className="tab-duplicate"
              onClick={(e) => {
                e.stopPropagation();
                duplicate(tab);
              }}
              aria-label={`Open another ${tab.title}`}
              title={`Open another ${tab.title}`}
            >
              <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M7 2 L7 12 M2 7 L12 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              aria-label={`Close ${label}`}
              title="Close tab"
            >
              <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M2 2 L12 12 M12 2 L2 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
