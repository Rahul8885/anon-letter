import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Button } from "./components/ui/Button";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { Compose } from "./pages/Compose";
import { Home } from "./pages/Home";
import { Message } from "./pages/Message";
import { Success } from "./pages/Success";

export function App() {
  const location = useLocation();
  const reduced = useReducedMotion();

  // route changes start at the top; the reveal in particular must never open mid-scroll
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the intended trigger
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.1 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/success/:slug" element={<Success />} />
          <Route path="/m/:slug" element={<Message />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function NotFound() {
  return (
    <div className="state-page">
      <h1 className="t-h1">Nothing was sent here.</h1>
      <p className="measure-caption" style={{ color: "var(--text-dim)" }}>
        This address doesn&rsquo;t point at a letter. If someone sent you one, the link will have
        come by email.
      </p>
      <Link to="/">
        <Button>Go to AnonLetter</Button>
      </Link>
    </div>
  );
}
