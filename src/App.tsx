import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { lazy, Suspense } from 'react';
import Cover from '@/pages/Cover';
import Intro from '@/pages/Intro';
import TableOfContents from '@/pages/TableOfContents';
import UnitPage from '@/pages/UnitPage';
import AppendixPage from '@/pages/AppendixPage';
import PromptsPage from '@/pages/PromptsPage';
import CapstonePage from '@/pages/CapstonePage';
import NotFound from '@/pages/not-found';
import RoadmapPage from '@/pages/RoadmapPage';
import SearchPage from '@/pages/SearchPage';
import QuizReviewPage from '@/pages/QuizReviewPage';

/**
 * Lab pages are lazy-loaded so Monaco (~1 MB) and the Lab UI bundle
 * are NOT pulled in until the user actually enters /lab/*.
 */
const LabPage            = lazy(() => import('@/pages/LabPage'));
const LabWorkspacePage   = lazy(() => import('@/pages/LabWorkspacePage'));
const LabProjectPage     = lazy(() => import('@/pages/LabProjectPage'));
const LabLessonModePage  = lazy(() => import('@/pages/LabLessonModePage'));
const LabGuidedPage      = lazy(() => import('@/pages/LabGuidedPage'));
const GuidedIndexPage    = lazy(() => import('@/pages/LabGuidedPage').then((m) => ({ default: m.GuidedIndex })));

function LabFallback() {
  return (
    <div className="min-h-screen grid place-items-center text-muted-foreground text-sm bg-background">
      <div className="flex items-center gap-2">
        <span className="h-5 w-5 rounded-full border-2 border-primary border-r-transparent animate-spin" />
        يتم تحميل المختبر…
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Suspense fallback={<LabFallback />}>
      <Switch>
        <Route path="/" component={Cover} />
        <Route path="/intro" component={Intro} />
        <Route path="/toc" component={TableOfContents} />
        <Route path="/roadmap" component={RoadmapPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/quiz/review" component={QuizReviewPage} />
        {/* Stage-level helpers */}
        <Route path="/stage" component={TableOfContents} />
        <Route path="/stage/:stageId" component={TableOfContents} />
        <Route path="/stage/:stageId/unit/:unitId" component={UnitPage} />
        <Route path="/appendix" component={AppendixPage} />
        <Route path="/prompts" component={PromptsPage} />
        <Route path="/capstone" component={CapstonePage} />
        {/* Smart Code Lab */}
        <Route path="/lab" component={LabPage} />
        <Route path="/lab/workspace/:id" component={LabWorkspacePage} />
        <Route path="/lab/project/:id" component={LabProjectPage} />
        <Route path="/lab/lesson/:stageId/:unitId" component={LabLessonModePage} />
        <Route path="/lab/guided" component={GuidedIndexPage} />
        <Route path="/lab/guided/:exerciseId" component={LabGuidedPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Hash-based routing so GitHub Pages deep links resolve without
            depending on a 404.html fallback. Internal wouter <Link href="...">
            auto-prefix with "#" so URLs become "#/intro", "#/toc", etc. */}
        <WouterRouter hook={useHashLocation}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
