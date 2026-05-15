'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TOPICS, getTopic, topicHref } from '@/topics';

const STORAGE_KEY = 'combotool.openTabs';

const TabsContext = createContext({
  openTabs: [],
  closeTab: () => {},
  closeAll: () => {},
});

/**
 * Tracks which topic pages the user currently has "open" — like browser tabs.
 *
 *   • A topic is auto-added when the user lands on `/<slug>`
 *   • The set is persisted to localStorage and restored on next visit
 *   • Closing a tab removes it; closing the active tab navigates to the
 *     next remaining tab (or `/topics` if none are left)
 */
export function TabsProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openSlugs, setOpenSlugs] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Drop any stored slugs that are no longer in the registry
          const valid = parsed.filter((s) => typeof s === 'string' && getTopic(s));
          setOpenSlugs(valid);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist whenever the open set changes (after initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(openSlugs));
    } catch {
      // ignore quota errors
    }
  }, [openSlugs, hydrated]);

  // Auto-add the current page if it's a topic route
  useEffect(() => {
    if (!pathname) return;
    // Match `/<slug>` exactly, ignoring nested or special routes
    const m = pathname.match(/^\/([^/]+)\/?$/);
    if (!m) return;
    const slug = m[1];
    if (slug === 'topics') return; // /topics is the browse page, not a topic
    if (!getTopic(slug)) return;   // unknown slug
    setOpenSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
  }, [pathname]);

  const closeTab = useCallback(
    (slug) => {
      setOpenSlugs((prev) => {
        const next = prev.filter((s) => s !== slug);
        // If we're closing the currently-active tab, navigate elsewhere.
        if (pathname === `/${slug}`) {
          const fallback =
            next.length > 0 ? `/${next[next.length - 1]}` : '/topics';
          // queueMicrotask: navigate after this state update commits
          queueMicrotask(() => router.push(fallback));
        }
        return next;
      });
    },
    [pathname, router]
  );

  const closeAll = useCallback(() => {
    setOpenSlugs([]);
    if (pathname && pathname !== '/' && pathname !== '/topics') {
      queueMicrotask(() => router.push('/topics'));
    }
  }, [pathname, router]);

  const openTabs = useMemo(
    () => openSlugs.map((slug) => getTopic(slug)).filter(Boolean),
    [openSlugs]
  );

  const value = useMemo(
    () => ({ openTabs, closeTab, closeAll, hydrated }),
    [openTabs, closeTab, closeAll, hydrated]
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export const useTabs = () => useContext(TabsContext);
export { topicHref };
