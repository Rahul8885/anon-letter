import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { Suspense, lazy, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { StaggeredText } from "./components/ui/StaggeredText";
import { usePageMeta } from "./hooks/usePageMeta";
import { useRouteScroll } from "./hooks/useRouteScroll";
import { afterPageLoad } from "./lib/images";
import { loadRoomFontSheet } from "./lib/roomFonts";
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

/**
 * After the page has fully loaded (so nothing competes with the hero), fetch the room fonts and
 * the other pages in idle time. Hovering or focusing a "write" link fetches Compose at once.
 */
function warmUpAfterLoad() {
  const onIntent = (event: Event) => {
    const link = (event.target as Element | null)?.closest?.('a[href="/compose"]');
    if (link) loadCompose().catch(() => {});
  };
  document.addEventListener("pointerover", onIntent, { passive: true });
  document.addEventListener("focusin", onIntent);

  afterPageLoad(() => {
    const run = () => {
      loadRoomFontSheet();
      for (const load of [loadCompose, loadPreview, loadSuccess, loadMessage]) {
        load().catch(() => {});
      }
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 3000 });
    else setTimeout(run, 1000);
  });

  return () => {
    document.removeEventListener("pointerover", onIntent);
    document.removeEventListener("focusin", onIntent);
  };
}

export function App() {
  useRouteScroll();
  usePageMeta();
  useEffect(warmUpAfterLoad, []);

  return (
    // domAnimation, not the full bundle: the site uses no layout/drag animations. Loaded
    // synchronously so the hero's word reveal never waits on a second chunk.
    <LazyMotion features={domAnimation} strict>
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
    </LazyMotion>
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
