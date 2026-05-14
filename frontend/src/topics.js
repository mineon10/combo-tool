/**
 * Topic registry — the single source of truth for every interactive page on ComboTool.
 *
 * Each entry powers:
 *   • The home page's "Where to Go Next" cards
 *   • The (future) search & browse page
 *   • Per-route SEO metadata (title, description)
 *   • The (future) sitemap and OpenGraph cards
 *
 * To add a topic:
 *   1. Push a new entry to TOPICS below
 *   2. Create the page at `src/app/<slug>/page.js` (omit for placeholders)
 *   3. Build/import the visualizer component the page renders
 */

/**
 * @typedef {Object} Topic
 * @property {string} slug      URL-safe id; also the route segment under `/`
 * @property {string} title     Human-readable name shown in cards & headings
 * @property {string} subject   Top-level grouping (e.g., 'Mathematics', 'Physics')
 * @property {string} category  Sub-grouping (e.g., 'Linear Algebra', 'Calculus')
 * @property {string[]} tags    Searchable keywords
 * @property {string} summary   One-sentence pitch shown in cards & search results
 * @property {'introductory'|'undergraduate'|'graduate'} difficulty
 * @property {'live'|'planned'} [status]  Defaults to 'live'. 'planned' = placeholder, no page yet.
 */

/** @type {Topic[]} */
export const TOPICS = [
  {
    slug: 'permutations',
    title: 'Permutation Matrices',
    subject: 'Mathematics',
    category: 'Linear Algebra',
    tags: ['matrix', 'vector', 'permutation', 'discrete', 'group theory', 'orthogonal'],
    summary:
      'Interactive permutation matrices, row-by-row dot products, and visual element flow.',
    difficulty: 'undergraduate',
    status: 'live',
  },
  {
    slug: 'projections',
    title: 'Projection Matrices',
    subject: 'Mathematics',
    category: 'Linear Algebra',
    tags: ['matrix', 'projection', 'subspace', 'orthogonal', 'least squares'],
    summary:
      'Project vectors onto subspaces and explore the geometry of orthogonal decomposition.',
    difficulty: 'undergraduate',
    status: 'planned',
  },
  {
    slug: 'binomial-coefficients',
    title: 'Binomial Coefficients & Pascal’s Triangle',
    subject: 'Mathematics',
    category: 'Combinatorics',
    tags: ['combinatorics', 'binomial', 'pascal', 'counting', 'discrete'],
    summary:
      'Visualize how combinations build up Pascal’s triangle and connect to the binomial theorem.',
    difficulty: 'introductory',
    status: 'planned',
  },
];

/** Returns true if the topic is fully implemented (clickable, has a page). */
export const isLive = (topic) => topic.status !== 'planned';

/** Look up a topic by slug. Returns undefined if not found. */
export const getTopic = (slug) => TOPICS.find((t) => t.slug === slug);

/** Resolve the URL path for a topic. */
export const topicHref = (topic) => `/${topic.slug}`;
