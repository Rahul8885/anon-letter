import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { Compose } from "./pages/Compose";
import { Message } from "./pages/Message";
import { Success } from "./pages/Success";

export function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/success/:slug" element={<Success />} />
          <Route path="/m/:slug" element={<Message />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
