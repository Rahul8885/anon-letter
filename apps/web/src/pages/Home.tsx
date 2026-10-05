import type { TemplateId } from "@anonletter/shared";
import { AnimatePresence, motion } from "framer-motion";
import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TemplatePicker } from "../components/composer/TemplatePicker";
import { Arrow, EditorialHero } from "../components/editorial/EditorialHero";
import { useReveal } from "../hooks/useReveal";
import { LETTER_PALETTES, letterPaletteStyle, paperToneMatrix } from "../lib/letterPalette";
import { SAMPLE_MESSAGE, room } from "../lib/moods";
import { DURATION, EASE_ENTER } from "../lib/motion";
import { useComposerStore } from "../store/composerStore";

const STEPS = [
  ["Choose a mood", "Pick the feeling you want the letter to carry."],
  ["Write your message", "Keep it honest, simple, and personal."],
  ["Enter their email", "The letter is delivered directly to their inbox."],
  ["Stay anonymous", "Your identity is not shown to the recipient."],
];
/** Each fragment opens the composer in the room that suits it. */
const USES: [string, TemplateId][] = [
  ["A secret compliment", "soft-bloom"],
  ["An apology", "old-letter"],
  ["A thank-you", "old-letter"],
  ["A confession", "night-thought"],
  ["A birthday note", "quiet-garden"],
  ["A little encouragement", "confetti-love"],
];

const swap = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: DURATION.ui, ease: EASE_ENTER },
};

function writeIn(mood: TemplateId) {
  useComposerStore.getState().setMood(mood);
}

export function Home() {
  const [mood, setMood] = useState<TemplateId>("soft-bloom");
  const [preview, setPreview] = useState<TemplateId | null>(null);
  const shown = preview ?? mood;
  const site = useRef<HTMLDivElement>(null);
  const stockFilterId = `recipient-stock-${useId().replace(/:/g, "")}`;
  useReveal(site);

  return (
    <div className="sayless-site" ref={site}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="sayless-nav">
        <Link className="sayless-wordmark" to="/" aria-label="SAYLESS home">
          SAYLESS<span className="wordmark-period">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#moods">Moods</a>
          <a href="#how">How it works</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <Link className="nav-write" to="/compose">
          Write a letter <Arrow />
        </Link>
      </header>
      <main id="main">
        <EditorialHero />
        <section className="desk-section mood-section" id="moods" aria-labelledby="moods-title">
          <div className="desk-heading" data-reveal>
            <h2 id="moods-title">Choose a feeling.</h2>
            <p>Five rooms for five different ways of saying something.</p>
          </div>
          <div className="mood-desk" data-reveal="desk">
            <TemplatePicker value={mood} onChange={setMood} onPreview={setPreview} />
          </div>
          <div className="mood-caption">
            <p aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span className="mood-caption-text" key={shown} {...swap}>
                  <strong>{room(shown).name}</strong>
                  <span>{room(shown).useCase}</span>
                </motion.span>
              </AnimatePresence>
            </p>
            <Link className="btn-outline" to="/compose" onClick={() => writeIn(mood)}>
              Write in {room(mood).name} <Arrow />
            </Link>
          </div>
        </section>
        <section className="desk-section how-section" id="how" aria-labelledby="how-title">
          <div className="how-intro" data-reveal>
            <h2 id="how-title">
              Write it.
              <br />
              Send it.
              <br />
              Let it go.
            </h2>
            <p>Some things are easier to say on paper.</p>
          </div>
          <ol className="letter-steps" data-reveal="steps">
            {STEPS.map(([title, copy]) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </section>
        <section
          className="desk-section privacy-section"
          id="privacy"
          aria-labelledby="privacy-title"
        >
          <div className="privacy-note" data-reveal="paper">
            <img
              src="/assets/letter-world/letter-paper.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div>
              <p>This letter is from</p>
              <span className="unsigned-line">someone who cares</span>
              <strong>That’s all they need to know.</strong>
              <span className="privacy-note-footer">No name. Just your words.</span>
            </div>
          </div>
          <div className="privacy-copy" data-reveal>
            <h2 id="privacy-title">Anonymous means anonymous.</h2>
            <p>
              You don’t need an account. Your name is never shown. The recipient’s email is used for
              delivery and is not saved in the database.
            </p>
            <ul>
              <li>No account to create</li>
              <li>No identity attached</li>
              <li>No email kept after delivery</li>
            </ul>
          </div>
        </section>
        <section className="desk-section recipient-section" aria-labelledby="recipient-title">
          <div className="recipient-copy" data-reveal>
            <h2 id="recipient-title">What they receive.</h2>
            <p>
              A quiet email. A private link.
              <br />A letter that opens like a moment.
            </p>
            <Link className="btn-outline" to={`/m/demo-${mood}`}>
              See it through their eyes <Arrow />
            </Link>
          </div>
          <div className="recipient-desk" data-reveal="paper">
            <svg className="paper-filter" width="0" height="0" aria-hidden="true" focusable="false">
              <defs>
                <filter id={stockFilterId} colorInterpolationFilters="sRGB">
                  <feColorMatrix
                    type="matrix"
                    values={paperToneMatrix(LETTER_PALETTES[mood].paper)}
                  />
                </filter>
              </defs>
            </svg>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.article
                key={mood}
                className="recipient-letter"
                data-mood={mood}
                style={
                  {
                    ...letterPaletteStyle(mood, true),
                    "--letter-stock-filter": `url("#${stockFilterId}")`,
                  } as CSSProperties
                }
                initial={{ opacity: 0, y: -14, rotate: 6 }}
                animate={{ opacity: 1, y: 0, rotate: 4 }}
                exit={{ opacity: 0, y: 18, rotate: 2 }}
                transition={{ duration: DURATION.object, ease: EASE_ENTER }}
              >
                <img
                  src="/assets/letter-world/letter-paper.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
                <div>
                  <span>Someone wrote this for you.</span>
                  <p>{SAMPLE_MESSAGE[mood]}</p>
                  <small>— {room(mood).signature}</small>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </section>
        <section className="desk-section use-section" aria-labelledby="uses-title">
          <div className="desk-heading" data-reveal>
            <h2 id="uses-title">
              For the things that
              <br />
              are hard to say.
            </h2>
          </div>
          <ul className="use-fragments" data-reveal="scatter">
            {USES.map(([title, useMood], index) => (
              <li key={title}>
                <Link
                  className={`use-fragment fragment-${index + 1}`}
                  to="/compose"
                  onClick={() => writeIn(useMood)}
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section
          className="desk-section final-letter-cta"
          aria-labelledby="final-title"
          data-reveal="final"
        >
          <img
            src="/assets/letter-world/envelope-rose.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <div>
            <h2 id="final-title">
              Some words deserve
              <br />
              to be sent.
            </h2>
            <p>Choose a feeling, write the letter, and let it go.</p>
            <Link className="letter-cta" to="/compose">
              Write a letter <Arrow />
            </Link>
          </div>
        </section>
      </main>
      <footer className="sayless-footer">
        <Link className="sayless-wordmark" to="/">
          SAYLESS<span className="wordmark-period">.</span>
        </Link>
        <span>A little less unsaid.</span>
        <nav aria-label="Footer">
          <a href="#privacy">Privacy</a>
          <span>Open source · MIT License</span>
        </nav>
      </footer>
      <PocketWrite />
    </div>
  );
}

/**
 * Phones hide the anchor nav, so once the hero's own button has scrolled away a slim
 * write action waits in the thumb zone. It steps aside again for the closing invitation.
 */
function PocketWrite() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const heroCta = document.querySelector(".sayless-hero .letter-cta");
    const ending = [".final-letter-cta", ".sayless-footer"]
      .map((selector) => document.querySelector(selector))
      .filter((el): el is Element => el !== null);
    if (!heroCta || !("IntersectionObserver" in window)) return;
    let pastHero = false;
    const atEnd = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === heroCta) {
          pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        } else if (entry.isIntersecting) {
          atEnd.add(entry.target);
        } else {
          atEnd.delete(entry.target);
        }
      }
      setShow(pastHero && atEnd.size === 0);
    });
    observer.observe(heroCta);
    for (const el of ending) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="pocket-write"
      data-show={show}
      aria-hidden={!show}
      {...(!show ? { inert: "" } : {})}
    >
      <span>No account. No name.</span>
      <Link className="letter-cta" to="/compose" tabIndex={show ? undefined : -1}>
        Write a letter <Arrow />
      </Link>
    </div>
  );
}
