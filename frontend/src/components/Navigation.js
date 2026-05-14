'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home' },
  { href: '/topics', label: 'Browse' },
];

// Browse should stay highlighted on any topic page, not just /topics itself.
const isActiveTab = (pathname, href) => {
  if (href === '/') return pathname === '/';
  if (href === '/topics') return pathname !== '/';
  return pathname === href;
};

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="brand-link">
        <h1>
          <span className="brand-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#fff" opacity="0.95" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#fff" opacity="0.55" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#fff" opacity="0.55" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#fff" opacity="0.95" />
            </svg>
          </span>
          <span className="brand-text">ComboTool</span>
          <span className="brand-tag">Combinatorics &amp; Linear Algebra</span>
        </h1>
      </Link>
      <div className="nav-links">
        {TABS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={isActiveTab(pathname, href) ? 'active' : ''}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
