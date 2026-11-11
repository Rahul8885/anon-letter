import { MotionConfig } from "framer-motion";
import { Suspense, lazy, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { StaggeredText } from "./components/ui/StaggeredText";
import { usePageMeta } from "./hooks/usePageMeta";
import { useRouteScroll } from "./hooks/useRouteScroll";
import { Home } from "./pages/Home";

// Only the landing page ships in the first bundle; the rest are fetched once the browser is idle,
// so a click on "Write a letter" never lands on a blank frame.
const loadCompose = () => import("./pages/Compose");
const loadMessage = () => import("./pages/Message");
const loadPreview = () => import("./pages/Preview");
const loadSuccess = () => import("./pages/Success");

const Compose = lazy(() => loadCompose().then((m) => ({ default: m.Compose })));
const Message = lazy(() => loadMessage().then((m) => ({ default: m.Message })));
const Preview = lazy(() => loadPreview().then((m) => ({ default: m.Preview })));
const Success = lazy(() => loadSuccess().then((m) => ({ default: m.Success })));

function prefetchRooms() {
  const run = () => {
    for (const load of [loadCompose, loadPreview, loadSuccess, loadMessage]) load().catch(() => {});
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2000);
}

export function App() {
  useRouteScroll();
  usePageMeta();
  useEffect(prefetchRooms, []);

  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/success/:slug" element={<Success />} />
          <Route path="/m/:slug" element={<Message />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </MotionConfig>
  );
}

function NotFound() {
  return (
    <div className="state-page">
      <StaggeredText as="h1" className="t-h1" text="Nothing was sent here." play />
      <p className="measure-caption" style={{ color: "var(--text-dim)" }}>
        This address doesn&rsquo;t point at a letter. If someone sent you one, the link will have
        come by email or a shared link.
      </p>
      <div className="state-actions">
        <Link className="btn btn-primary" to="/compose">
          Write a letter
        </Link>
        <Link className="btn btn-secondary" to="/">
          Go to Unsaid
        </Link>
      </div>
    </div>
  );
}
