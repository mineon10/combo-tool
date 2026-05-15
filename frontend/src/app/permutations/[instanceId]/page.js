import { PermutationVisualizer } from '@/visualizers/PermutationVisualizer';

// The `key` on the visualizer forces React to mount a fresh instance whenever
// the user switches to a different tab id, so each open permutations tab has
// its own independent matrix/vector state.
export default function PermutationsInstancePage({ params }) {
  return <PermutationVisualizer key={params.instanceId} />;
}
