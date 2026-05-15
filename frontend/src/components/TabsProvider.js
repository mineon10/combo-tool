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

// sessionStorage (not localStorage): tabs survive a refresh and in-tab
// navigation, but a fresh browser session starts with no tabs open.
const tabStore = typeof window !== 'undefined' ? window.sessionStorage : null;

const TabsContext = createContext({
  openTabs: [],
  closeTab: () => {},
  closeAll: () => {},
});

// Short, URL-safe random identifier for a tab instance.
const generateTabId = () => Math.random().toString(36).slice(2, 9);

/**
 * Tracks which topic pages the user currently has "open" — like browser tabs.
 * Each tab carries its own id so multiple tabs of the same topic can coexist.
 *
 *   • A topic page is auto-added to the tab list when the user lands on it
 *   • The list lives in sessionStorage so a refresh keeps the tabs, but a
 *     brand-new browser session starts with an empty tab bar
 *   • Closing the active tab navigates to whichever tab is now last in the
 *     list (or to the Browse page if none remain)
 */
export function TabsProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  // Each entry is { id, slug } — id is unique per open tab, slug names the topic.
  const [tabs, setTabs] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = tabStore?.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed
            .filter(
              (t) =>
                t &&
                typeof t.id === 'string' &&
                typeof t.slug === 'string' &&
                getTopic(t.slug)
            )
            .map((t) => ({ id: t.id, slug: t.slug }));
          setTabs(valid);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist whenever the tab list changes (after initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      tabStore?.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch {
      // ignore quota errors
    }
  }, [tabs, hydrated]);

  // Auto-add the current page if it's a topic route. Single-instance for now —
  // path-based multi-instance routing lands in a follow-up step.
  useEffect(() => {
    if (!pathname) return;
    const m = pathname.match(/^\/([^/]+)\/?$/);
    if (!m) return;
    const slug = m[1];
    if (slug === 'topics') return;
    if (!getTopic(slug)) return;
    setTabs((prev) => {
      if (prev.some((t) => t.slug === slug)) return prev;
      return [...prev, { id: generateTabId(), slug }];
    });
  }, [pathname]);

  const closeTab = useCallback(
    (id) => {
      setTabs((prev) => {
        const closing = prev.find((t) => t.id === id);
        if (!closing) return prev;
        const next = prev.filter((t) => t.id !== id);
        // If we're closing the currently-active tab, navigate elsewhere.
        if (pathname === `/${closing.slug}`) {
          const fallback =
            next.length > 0 ? `/${next[next.length - 1].slug}` : '/topics';
          queueMicrotask(() => router.push(fallback));
        }
        return next;
      });
    },
    [pathname, router]
  );

  const closeAll = useCallback(() => {
    setTabs([]);
    if (pathname && pathname !== '/' && pathname !== '/topics') {
      queueMicrotask(() => router.push('/topics'));
    }
  }, [pathname, router]);

  // Public view: each tab carries its topic metadata plus its tab id.
  const openTabs = useMemo(
    () =>
      tabs
        .map((tab) => {
          const topic = getTopic(tab.slug);
          if (!topic) return null;
          return { ...topic, id: tab.id };
        })
        .filter(Boolean),
    [tabs]
  );

  const value = useMemo(
    () => ({ openTabs, closeTab, closeAll, hydrated }),
    [openTabs, closeTab, closeAll, hydrated]
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export const useTabs = () => useContext(TabsContext);
export { topicHref };
