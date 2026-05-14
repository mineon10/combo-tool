import { TopicsBrowser } from '@/components/TopicsBrowser';

export const metadata = {
  title: 'Browse Topics · ComboTool',
  description:
    'Search and filter every interactive visualization on ComboTool — by name, tag, or category.',
};

export default function TopicsPage() {
  return <TopicsBrowser />;
}
