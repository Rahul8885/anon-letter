import type { TemplateId } from "@anonletter/shared";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TemplatePicker } from "../components/composer/TemplatePicker";
import { Envelope } from "../components/envelope/Envelope";
import { LetterRoom } from "../components/templates/LetterRoom";
import { Button } from "../components/ui/Button";
import { useLenis } from "../hooks/useLenis";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useTypewriter } from "../hooks/useTypewriter";
import { ROOMS, SAMPLE_MESSAGE, room } from "../lib/moods";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE = [
  { text: "Someone", em: false },
  { text: "has", em: false },
  { text: "something", em: false },
  { text: "\n", em: false },
  { text: "to", em: true },
  { text: "tell", em: true },
  { text: "you.", em: true },
];

/**
 * The hero is the thesis: a sealed envelope that opens once, on its own, while the headline
 * assembles around it. Nothing else on the page competes.
 */
export function Home() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [envelope, setEnvelope] = useState<"sealed" | "opening" | "open">(
    reduced ? "open" : "sealed",
  );
  const [preview, setPreview] = useState<TemplateId>("night-thought");
  const [typing, setTyping] = useState(false);

  useLenis();

  const demo = useTypewriter(SAMPLE_MESSAGE[preview], { start: typing, instant: reduced });

  useEffect(() => {
    if (reduced) {
      setEnvelope("open");
      return;
    }
    const toOpening = window.setTimeout(() => setEnvelope("opening"), 2100);
    const toOpen = window.setTimeout(() => setEnvelope("open"), 3300);
    return () => {
      window.clearTimeout(toOpening);
      window.clearTimeout(toOpen);
    };
  }, [reduced]);

  useEffect(() => {
    if (!root.current) return;

    const ctx = gsap.context(() => {
      if (!reduced) {
        // gsap.from() means the resting state is whatever the DOM already renders. If the
        // script never runs, the page is simply visible rather than blank.
        const tl = gsap.timeline({ delay: 0.3 });
        tl.from(".js-wordmark", { opacity: 0, duration: 1.2, ease: "power2.out" })
          .from(".js-envelope", { opacity: 0, y: 30, duration: 1.2, ease: "power3.out" }, 0.9)
          .from(
            ".hero-word-inner",
            {
              yPercent: 110,
              skewY: 3,
              opacity: 0,
              duration: 0.9,
              stagger: 0.12,
              ease: "power3.out",
            },
            3.2,
          )
          .from(
            ".js-hero-reveal",
            { opacity: 0, y: 12, duration: 0.8, stagger: 0.14, ease: "power3.out" },
            3.9,
          );

        // hero parallaxes at 0.85 while the glow holds — the light stays, the object leaves
        gsap.to(".js-envelope", {
          yPercent: -22,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        });
      }

      for (const el of gsap.utils.toArray<HTMLElement>(".js-reveal")) {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 92%" },
          y: 28,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
        });
      }

      ScrollTrigger.create({
        trigger: ".js-demo",
        start: "top 74%",
        once: true,
        onEnter: () => setTyping(true),
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  const previewRoom = room(preview);

  return (
    <div className="shell" ref={root} style={{ ["--room-glow" as string]: ROOMS[preview].glow }}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="glow" />

      <header className="topbar">
        <span className="js-wordmark" style={{ color: "var(--gold)" }}>
          AnonLetter
        </span>
        <span style={{ maxWidth: "13rem", lineHeight: 1.9, textAlign: "right" }}>
          Anonymous letters,
          <br />
          delivered once and never stored
        </span>
      </header>

      <main id="main">
        {/* ---- hero ---- */}
        <section className="hero">
          <div className="js-envelope" style={{ marginBottom: "var(--s12)" }}>
            <Envelope state={envelope} size="clamp(230px, 30vw, 360px)" alive />
          </div>

          <h1 className="t-display" style={{ margin: 0 }}>
            {HEADLINE.map((word, i) =>
              word.text === "\n" ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: static headline
                <br key={i} />
              ) : (
                // The space is a sibling of the inline-block, never a non-breaking space inside
                // it. Whitespace inside an overflow:hidden inline-block gives the line no
                // break opportunity, and the headline runs off the side of a phone.
                <Fragment key={word.text}>
                  <span className="hero-word">
                    <span
                      className="hero-word-inner"
                      style={{
                        fontStyle: word.em ? "italic" : undefined,
                        color: word.em ? "var(--gold)" : undefined,
                      }}
                    >
                      {word.text}
                    </span>
                  </span>{" "}
                </Fragment>
              ),
            )}
          </h1>

          <p
            className="js-hero-reveal t-label"
            style={{ marginTop: "var(--s6)", color: "var(--text-mute)" }}
          >
            Beautiful · anonymous · delivered to their inbox
          </p>

          <div className="hero-actions js-hero-reveal">
            <Link to="/compose">
              <Button>Write a letter</Button>
            </Link>
            <a href="#moods">
              <Button variant="secondary">See the moods</Button>
            </a>
          </div>

          <div className="scroll-hint js-hero-reveal" aria-hidden="true">
            <span>Scroll</span>
            <span className="scroll-rule" />
          </div>
        </section>

        {/* ---- moods ---- */}
        <section className="section" id="moods">
          <div className="page">
            <div className="js-reveal" style={{ marginBottom: "var(--s12)" }}>
              <p className="t-label" style={{ color: "rgba(200,169,110,0.65)" }}>
                Five moods. One letter.
              </p>
              <h2 className="t-h1" style={{ marginTop: "var(--s6)" }}>
                Pick a feeling,
                <br />
                <em className="t-em">not a template.</em>
              </h2>
              <p
                className="measure-prose"
                style={{ marginTop: "var(--s3)", color: "var(--text-dim)" }}
              >
                Each one has its own palette, typeface and single gesture. Hover a card and the
                light on this page changes to match the room you would be writing in.
              </p>
            </div>

            <div className="js-reveal">
              <TemplatePicker
                value={preview}
                onChange={setPreview}
                onPreview={(id) => id && setPreview(id)}
              />
            </div>
          </div>
        </section>

        {/* ---- what they see ---- */}
        <section className="section js-demo">
          <div className="page">
            <div className="js-reveal" style={{ marginBottom: "var(--s12)" }}>
              <h2 className="t-h1">
                The moment
                <br />
                <em className="t-em">the letter opens.</em>
              </h2>
              <p
                className="measure-prose"
                style={{ marginTop: "var(--s3)", color: "var(--text-dim)" }}
              >
                This is {previewRoom.name}, live. The message types at human speed, the room
                settles, and nothing asks them to sign up for anything.
              </p>
            </div>

            <div
              className="js-reveal"
              style={{
                borderRadius: "var(--r-sheet)",
                overflow: "hidden",
                boxShadow: "0 50px 100px rgba(0,0,0,0.55)",
              }}
            >
              <LetterRoom mood={preview} eyebrow={previewRoom.name} burst={typing}>
                <div className="letter-stack">
                  <p className="letter-greeting">{previewRoom.greeting}</p>
                  <p className="letter-body">
                    {demo.visible}
                    {!demo.done && <span className="caret" />}
                  </p>
                  <hr className="letter-rule" style={{ opacity: demo.done ? 1 : 0 }} />
                  <p className="letter-sign" style={{ opacity: demo.done ? 1 : 0 }}>
                    — from {previewRoom.signature}
                  </p>
                </div>
                <div className="room-rail">
                  <span>{previewRoom.railNote}</span>
                  <span>Report</span>
                </div>
              </LetterRoom>
            </div>
          </div>
        </section>

        {/* ---- how it works. Numbered because it genuinely is a sequence. ---- */}
        <section className="section">
          <div className="page">
            <h2 className="t-h1 js-reveal" style={{ marginBottom: "var(--s12)" }}>
              Four steps,
              <br />
              <em className="t-em">under two minutes.</em>
            </h2>
            <ol className="step-row js-reveal" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {[
                ["Pick the mood", "The room carries the feeling before you type a word."],
                [
                  "Write it",
                  "Eight hundred characters. Enough to be honest, short enough to send.",
                ],
                ["Give their email", "Passed straight to delivery. Never written to the database."],
                ["It finds them", "They get a link and open the letter on a page built for it."],
              ].map(([title, copy], i) => (
                <li className="step-cell" key={title}>
                  <span className="step-index">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="t-h3" style={{ margin: "var(--s3) 0 var(--s2)" }}>
                    {title}
                  </h3>
                  <p className="t-caption" style={{ color: "var(--text-dim)" }}>
                    {copy}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---- closing ---- */}
        <section className="section">
          <div className="page" style={{ textAlign: "center" }}>
            <h2 className="t-display js-reveal" style={{ margin: 0 }}>
              Some things deserve
              <br />
              <em className="t-em">to be said properly.</em>
            </h2>
            <div className="hero-actions js-reveal">
              <Link to="/compose">
                <Button>Write a letter</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="topbar" style={{ borderTop: "1px solid var(--hairline)" }}>
        <span>AnonLetter</span>
        <span>The feeling is the feature</span>
      </footer>
    </div>
  );
}
