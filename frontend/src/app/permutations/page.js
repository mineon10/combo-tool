import { PermutationVisualizer } from '@/visualizers/PermutationVisualizer';

export const metadata = {
  title: 'Permutation Matrices · ComboTool',
  description:
    'Interactive permutation matrix visualizer — see how rows of P act on a vector and watch each element flow to its new position.',
};

export default function PermutationsPage() {
  return <PermutationVisualizer />;
}
