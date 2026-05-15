import { getTopic } from '@/topics';

const topic = getTopic('permutations');

export const metadata = {
  title: `${topic.title} · ComboTool`,
  description: topic.summary,
};

export default function PermutationsLayout({ children }) {
  return children;
}
