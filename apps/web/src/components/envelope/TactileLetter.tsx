import type { TemplateId } from "@anonletter/shared";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface Props {
  mood: TemplateId;
  children: ReactNode;
  onOpened?: () => void;
}

export function TactileLetter({ mood, children, onOpened }: Props) {
  const reduced = useReducedMotion();
  const [opened, setOpened] = useState(reduced);
  const isOpen = reduced || opened;
  useEffect(() => {
    if (isOpen) onOpened?.();
  }, [isOpen, onOpened]);
  return (
    <section className="ceremony" data-open={isOpen} data-mood={mood} aria-label="A private letter">
      {isOpen ? (
        <motion.article
          className="ceremony-letter"
          initial={reduced ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <img
            className="ceremony-paper-image"
            src="/assets/letter-world/letter-paper.webp"
            alt=""
            aria-hidden="true"
          />
          <div className="ceremony-letter-content">{children}</div>
        </motion.article>
      ) : (
        <div className="ceremony-sealed">
          <p>Someone wrote this for you.</p>
          <button
            className="ceremony-envelope"
            type="button"
            onClick={() => setOpened(true)}
            aria-label="Open your letter"
          >
            <img src={`/assets/letter-world/${mood}.webp`} alt="" aria-hidden="true" />
          </button>
          <button type="button" className="ceremony-open" onClick={() => setOpened(true)}>
            Open your letter{" "}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </button>
          <button type="button" className="ceremony-skip" onClick={() => setOpened(true)}>
            Read without ceremony
          </button>
        </div>
      )}
    </section>
  );
}
