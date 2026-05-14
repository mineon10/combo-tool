import Link from 'next/link';
import { TOPICS } from '@/topics';
import { TopicCard } from '@/components/TopicCard';

export function Home() {
  return (
    <div className="home-page">
      <div className="home-container">

        <header className="home-hero">
          <div className="home-eyebrow">A Visual Mathematics Companion</div>
          <h1 className="home-title">
            <span className="home-title-accent">Combinatorics</span> <span className="home-title-muted">Meets</span> <span className="home-title-accent">Linear Algebra</span>
          </h1>
          <p className="home-subtitle">
            Explore how discrete structures — permutations, projections, and subspaces — emerge from
            the language of matrices and vectors.
          </p>
        </header>

        <div className="home-divider" />

        <section className="home-section">
          <div className="home-section-head">
            <span className="home-section-label">§ 1</span>
            <h2 className="home-section-title">The Permutation Matrix</h2>
          </div>

          <div className="home-grid">
            <article className="home-card home-card--formal">
              <header className="home-card-head">
                <span className="home-card-icon">∑</span>
                <div>
                  <h3 className="home-card-title">Formal Definition</h3>
                  <p className="home-card-eyebrow">Mathematical notation</p>
                </div>
              </header>

              <p className="home-text">
                A <strong>permutation matrix</strong> is a square binary matrix
                {' '}<span className="mathvar">P</span>{' '}
                whose rows and columns each contain exactly one entry equal to{' '}
                <span className="mathvar">1</span>:
              </p>

              <div className="math-display">
                <span className="mathvar">P</span> ∈ {'{0, 1}'}<sup className="msup">n×n</sup>,
                {'  '}
                <span className="math-sum">∑</span><sub className="msub">j=1</sub><sup className="msup">n</sup>{' '}
                <span className="mathvar">P</span><sub className="msub">ij</sub> = 1
                {'  '}∀i,{'  '}
                <span className="math-sum">∑</span><sub className="msub">i=1</sub><sup className="msup">n</sup>{' '}
                <span className="mathvar">P</span><sub className="msub">ij</sub> = 1
                {'  '}∀j
              </div>

              <p className="home-text">
                Every such matrix corresponds to a unique permutation
                {' '}<span className="mathvar">σ</span>: {'{1, …, n}'} → {'{1, …, n}'}
                {' '}via the Kronecker-delta rule:
              </p>

              <div className="math-display">
                <span className="mathvar">P</span><sub className="msub">ij</sub> ={' '}
                δ<sub className="msub"><span className="mathvar">σ</span>(i),{' '}j</sub>
              </div>

              <p className="home-text">
                Acting on a vector{' '}<span className="mathvar">v</span> ∈ ℝ<sup className="msup">n</sup>,
                the matrix permutes its entries:
              </p>

              <div className="math-display">
                (<span className="mathvar">P</span><span className="mathvar">v</span>)<sub className="msub">i</sub>{' '}={' '}
                <span className="mathvar">v</span><sub className="msub"><span className="mathvar">σ</span>(i)</sub>
              </div>

              <p className="home-text">
                Permutation matrices are <strong>orthogonal</strong>, so
                {' '}<span className="mathvar">P</span><sup className="msup">−1</sup> ={' '}
                <span className="mathvar">P</span><sup className="msup">⊤</sup>, and the set of all{' '}
                n × n permutation matrices forms a group isomorphic to the symmetric group{' '}
                <span className="mathvar">S</span><sub className="msub">n</sub>.
              </p>
            </article>

            <article className="home-card home-card--plain">
              <header className="home-card-head">
                <span className="home-card-icon">✦</span>
                <div>
                  <h3 className="home-card-title">In Plain Terms</h3>
                  <p className="home-card-eyebrow">Intuition first</p>
                </div>
              </header>

              <p className="home-text">
                Imagine a row of numbered boxes. A <strong>permutation</strong> is just a recipe for
                rearranging them — "the box that was in spot 3 now belongs in spot 1," and so on.
              </p>

              <p className="home-text">
                A <strong>permutation matrix</strong> is the algebraic machine that performs that
                rearrangement. Every row of the matrix corresponds to one output slot, and the single{' '}
                <strong>1</strong> in that row points to the input element that should land there.
                The zeros say "ignore everything else."
              </p>

              <p className="home-text">
                Multiplying the matrix by a vector is the act of <em>running</em> the machine:
                values don't change, they just trade places. Because no information is lost, you can
                reverse the operation simply by flipping the matrix on its side — that's why
                permutation matrices are called <em>orthogonal</em>.
              </p>

              <div className="home-callout">
                <span className="home-callout-label">Try this</span>
                <p>
                  Head to the <Link className="home-link" href="/permutations">Permutations</Link> tab.
                  Click on a <strong>1</strong> in the matrix and watch how its position controls which input element ends up where in the output vector.
                </p>
              </div>
            </article>
          </div>
        </section>

        <div className="home-divider" />

        <section className="home-section">
          <div className="home-section-head">
            <span className="home-section-label">§ 2</span>
            <h2 className="home-section-title">Where to Go Next</h2>
          </div>

          <div className={`home-nav-grid${TOPICS.length === 1 ? ' home-nav-grid--single' : ''}`}>
            {TOPICS.map((topic, idx) => (
              <TopicCard key={topic.slug} topic={topic} index={idx} />
            ))}
          </div>
          <div className="home-browse-cta">
            <Link href="/topics" className="home-browse-link">
              Browse all topics →
            </Link>
          </div>
        </section>

        <footer className="home-footer">
          <span>ComboTool</span>
          <span className="home-footer-dot">·</span>
          <span>Mina Megalaa</span>
          <span className="home-footer-dot">·</span>
          <span>An educational visualizer for combinatorics &amp; linear algebra</span>
        </footer>
      </div>
    </div>
  );
}
