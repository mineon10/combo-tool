'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTabs, topicHref } from './TabsProvider';

export function TabBar() {
  const { openTabs, closeTab, hydrated } = useTabs();
  const pathname = usePathname();

  // Avoid SSR/hydration flash — render nothing until localStorage has been read
  if (!hydrated || openTabs.length === 0) return null;

  return (
    <div className="tab-bar" role="tablist" aria-label="Open topic tabs">
      {openTabs.map((tab) => {
        const href = topicHref(tab);
        const active = pathname === href;
        return (
          <div
            key={tab.id}
            className={`tab-item${active ? ' tab-item--active' : ''}`}
            role="tab"
            aria-selected={active}
          >
            <Link href={href} className="tab-link">
              {tab.title}
            </Link>
            <button
              type="button"
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              aria-label={`Close ${tab.title}`}
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
