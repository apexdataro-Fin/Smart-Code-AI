import { Shell } from '@/components/Shell';
import { Roadmap } from '@/components/Roadmap';
import { useProgress } from '@/lib/progress';

export default function RoadmapPage() {
  const [progress] = useProgress();
  return (
    <Shell>
      <ReadingFrame>
        <Roadmap progress={progress} />
      </ReadingFrame>
    </Shell>
  );
}

/**
 * Apply the `reading-container` class only when the user has toggled
 * reading mode. In normal mode the page keeps the existing max-w-4xl
 * container so navigation chrome is visible.
 */
function ReadingFrame({ children }: { children: React.ReactNode }) {
  return <div className="reading-container">{children}</div>;
}
