import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { StaggeredText } from "./components/ui/StaggeredText";
import { DURATION, EASE_ENTER } from "./lib/motion";
import { Compose } from "./pages/Compose";
import { Home } from "./pages/Home";
import { Message } from "./pages/Message";
import { Preview } from "./pages/Preview";
import { Success } from "./pages/Success";

export function App() {
  const location = useLocation();
  // the first page is already painted by the time React runs; only later pages enter
  const firstPage = useRef(true);

  // route changes start at the top; the reveal in particular must never open mid-scroll.
  // `instant` overrides the page's smooth scroll-behavior for this jump.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the intended trigger
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    firstPage.current = false;
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={firstPage.current ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.ui, ease: EASE_ENTER }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/compose" element={<Compose />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/success/:slug" element={<Success />} />
            <Route path="/m/:slug" element={<Message />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
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
