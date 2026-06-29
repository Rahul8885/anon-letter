import { TEMPLATE_LIST } from "@anonletter/shared";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useLenis } from "../hooks/useLenis";
import { typeMessage } from "../lib/typewriter";

gsap.registerPlugin(ScrollTrigger);

const sampleLetter =
  "I know we have not spoken in a while. I think about the day you read this, and I hope it finds you with the gentleness you deserved all along.";

export function Home() {
  const root = useRef<HTMLDivElement>(null);
  const typewriter = useRef<HTMLSpanElement>(null);
  const typed = useRef(false);
  useLenis();

  useEffect(() => {
    if (!root.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(".wordmark", { opacity: 1, duration: 0.8, ease: "power2.out" })
        .to(".hero-envelope", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.35")
        .to(".hero-line-word", {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: "power3.out"
        })
        .to(".hero-reveal", { opacity: 1, y: 0, duration: 0.65, stagger: 0.06 }, "-=0.25");

      gsap.to(".hero-envelope", {
        y: -8,
        repeat: -1,
        yoyo: true,
        duration: 3.2,
        ease: "sine.inOut",
        delay: 1.6
      });

      gsap.utils.toArray<HTMLElement>(".scroll-fade").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 82%" },
          y: 26,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out"
        });
      });

      ScrollTrigger.create({
        trigger: ".home-letter-card",
        start: "top 72%",
        onEnter: () => {
          if (typed.current || !typewriter.current) return;
          typed.current = true;
          typeMessage(typewriter.current, sampleLetter, () => {
            typewriter.current?.classList.add("done");
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="site-shell" ref={root}>
      <div className="ambient-glow" />
      <section className="hero">
        <span className="wordmark">AnonLetter</span>
        <div className="hero-envelope" aria-hidden="true">
          <div className="envelope-body">
            <div className="envelope-flap" />
            <div className="wax-seal">A</div>
            <div className="letter-peek">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
        <div className="hero-copy">
          <h1>
            {["Someone", "has", "something"].map((word) => (
              <span className="hero-line-word" key={word}>
                {word}
              </span>
            ))}
            <br />
            <em>
              {["to", "tell", "you."].map((word) => (
                <span className="hero-line-word" key={word}>
                  {word}
                </span>
              ))}
            </em>
          </h1>
          <p className="hero-sub hero-reveal">Beautiful. Anonymous. Delivered to their inbox.</p>
          <div className="hero-actions hero-reveal">
            <Link to="/compose">
              <Button>Write a letter</Button>
            </Link>
            <a href="#templates" className="button button-secondary">
              See templates
            </a>
          </div>
        </div>
      </section>

      <section className="section templates-section" id="templates">
        <div className="section-copy scroll-fade">
          <p className="section-label">Five moods, one letter</p>
          <h2>
            Pick a feeling,
            <br />
            <em>not a blank canvas.</em>
          </h2>
          <p>Each template is opinionated enough to make writing easier.</p>
        </div>
        <div className="template-strip scroll-fade">
          {TEMPLATE_LIST.map((template) => (
            <Link
              to="/compose"
              key={template.id}
              className={`template-tile template-${template.id}`}
              style={
                {
                  "--tile-bg": template.palette.bg,
                  "--tile-accent": template.palette.accent,
                  "--tile-text": template.palette.text
                } as CSSProperties
              }
            >
              <span>{template.motif}</span>
              <strong>{template.name}</strong>
              <small>{template.tags.slice(0, 2).join(" / ")}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section process-section">
        <div className="section-copy scroll-fade">
          <p className="section-label">How it works</p>
          <h2>
            A letter in
            <br />
            <em>under two minutes.</em>
          </h2>
        </div>
        <div className="steps-list">
          {[
            ["Choose a mood", "Five templates carry the feeling before you type."],
            ["Write the message", "Eight hundred characters keeps it honest and focused."],
            ["Enter their email", "It is passed to delivery and never written to the database."],
            ["It finds them", "They receive a private link and open the letter on its own page."]
          ].map(([title, copy]) => (
            <article className="process-step scroll-fade" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section preview-section">
        <div className="section-copy scroll-fade">
          <p className="section-label">What they see</p>
          <h2>
            The moment
            <br />
            <em>the letter opens.</em>
          </h2>
        </div>
        <article className="home-letter-card scroll-fade">
          <p className="letter-greeting">For you, whenever you are ready.</p>
          <p className="letter-body">
            <span ref={typewriter} />
          </p>
          <p className="letter-from">from someone who wanted you to know</p>
        </article>
      </section>

      <section className="closing">
        <h2>
          Some things deserve
          <br />
          <em>to be said beautifully.</em>
        </h2>
        <Link to="/compose">
          <Button>Write your letter</Button>
        </Link>
      </section>
    </div>
  );
}
