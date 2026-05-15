'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTabs } from '@/components/TabsProvider';
import { PageLoader } from '@/components/PageLoader';

// Entry point for the bare /permutations URL. Finds an existing permutations
// tab in the current session and refocuses it; otherwise opens a new instance.
// All actual rendering happens at /permutations/<instanceId>.
export default function PermutationsEntryPage() {
  const router = useRouter();
  const { openOrFocus, hydrated } = useTabs();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (!hydrated || didRedirect.current) return;
    didRedirect.current = true;
    const id = openOrFocus('permutations');
    router.replace(`/permutations/${id}`);
  }, [hydrated, openOrFocus, router]);

  return <PageLoader message="Opening permutations…" />;
}
