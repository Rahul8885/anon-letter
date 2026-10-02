import { useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "../../hooks/useReducedMotion";

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
  const isOpen = reduced || opened;
  return (
    <div className="hero-letter-scene" data-open={isOpen}>
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
    <section className="sayless-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">
          <span>For the things</span>
          <span>you couldn’t say</span>
          <span>out loud.</span>
        </h1>
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
