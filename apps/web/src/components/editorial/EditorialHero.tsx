import { type PointerEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { StaggeredText } from "../ui/StaggeredText";

export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={down ? "arrow-down" : undefined}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

/** Photography supplies the object; the words stay accessible, selectable HTML. */
export function LetterScene() {
  const reduced = useReducedMotion();
  const [opened, setOpened] = useState(reduced);
  // the drop-in plays once; afterwards open/close only transitions between resting states
  const [settled, setSettled] = useState(reduced);
  const scene = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const isOpen = reduced || opened;

  /** Fine pointers only: the objects drift a few pixels, nearer ones further. */
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const el = scene.current;
    if (!el) return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", ((clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty("--py", ((clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  }

  function onPointerLeave() {
    cancelAnimationFrame(frame.current);
    scene.current?.style.setProperty("--px", "0");
    scene.current?.style.setProperty("--py", "0");
  }

  return (
    <div
      ref={scene}
      className="hero-letter-scene"
      data-open={isOpen}
      data-settled={settled}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <img
        className="scene-botanical"
        src="/assets/letter-world/flower-stem.webp"
        alt=""
        aria-hidden="true"
      />
      <div className="scene-letter" aria-hidden={!isOpen}>
        <img src="/assets/letter-world/letter-paper.webp" alt="" aria-hidden="true" />
        <div className="scene-letter-words">
          <span>For you,</span>
          <p>Some people make the world feel a little softer. You are one of them.</p>
          <small>From someone who noticed.</small>
        </div>
      </div>
      <button
        type="button"
        className="scene-envelope"
        onClick={() => setOpened(!opened)}
        onAnimationEnd={() => setSettled(true)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close the example letter" : "Open the example letter"}
        disabled={reduced}
      >
        <img
          className="envelope-photo-closed"
          src="/assets/letter-world/envelope-rose.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        <img
          className="envelope-photo-open"
          src="/assets/letter-world/envelope-open.webp"
          alt=""
          aria-hidden="true"
        />
      </button>
      <button
        className="scene-invitation"
        type="button"
        onClick={() => setOpened(!opened)}
        disabled={reduced}
      >
        <span>
          {reduced
            ? "A few words can mean a lot."
            : isOpen
              ? "Close the letter"
              : "A letter, just for you. Open it."}
        </span>
        {!isOpen && <Arrow />}
      </button>
    </div>
  );
}

export function EditorialHero() {
  return (
    <section className="unsaid-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <StaggeredText
          as="h1"
          id="hero-title"
          text={"For the things\nyou couldn’t say\nout loud."}
          play
          startDelay={120}
          delay={95}
          duration={0.9}
          distance={0.45}
        />
        <p>
          Write a private letter to someone.
          <br />
          We’ll deliver it without your name.
        </p>
        <Link className="letter-cta" to="/compose">
          Write a letter <Arrow />
        </Link>
        <small className="hero-reassurance">
          No account <span>·</span> No signature <span>·</span> No saved email
        </small>
      </div>
      <LetterScene />
      <a className="desk-scroll" href="#moods">
        There’s a feeling for every letter <Arrow down />
      </a>
    </section>
  );
}
