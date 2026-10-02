import type { TemplateId } from "@anonletter/shared";
import { useState } from "react";
import { Link } from "react-router-dom";
import { TemplatePicker } from "../components/composer/TemplatePicker";
import { Arrow, EditorialHero } from "../components/editorial/EditorialHero";
import { SAMPLE_MESSAGE, room } from "../lib/moods";
import { useComposerStore } from "../store/composerStore";

const STEPS = [
  ["Choose a mood", "Pick the feeling you want the letter to carry."],
  ["Write your message", "Keep it honest, simple, and personal."],
  ["Enter their email", "The letter is delivered directly to their inbox."],
  ["Stay anonymous", "Your identity is not shown to the recipient."],
];
const USES = [
  "A secret compliment",
  "An apology",
  "A thank-you",
  "A confession",
  "A birthday note",
  "A little encouragement",
];

export function Home() {
  const [mood, setMood] = useState<TemplateId>("soft-bloom");
  return (
    <div className="sayless-site">
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
          <div className="desk-heading">
            <h2 id="moods-title">Choose a feeling.</h2>
            <p>Five rooms for five different ways of saying something.</p>
          </div>
          <TemplatePicker value={mood} onChange={setMood} />
          <div className="mood-caption">
            <p aria-live="polite">
              <strong>{room(mood).name}</strong>
              <span>{room(mood).useCase}</span>
            </p>
            <Link
              className="text-link"
              to="/compose"
              onClick={() => useComposerStore.getState().setMood(mood)}
            >
              Write in this mood <Arrow />
            </Link>
          </div>
        </section>
        <section className="desk-section how-section" id="how" aria-labelledby="how-title">
          <div className="how-intro">
            <h2 id="how-title">
              Write it.
              <br />
              Send it.
              <br />
              Let it go.
            </h2>
            <p>Some things are easier to say on paper.</p>
          </div>
          <ol className="letter-steps">
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
          <div className="privacy-note">
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
          <div className="privacy-copy">
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
          <div className="recipient-copy">
            <h2 id="recipient-title">What they receive.</h2>
            <p>
              A quiet email. A private link.
              <br />A letter that opens like a moment.
            </p>
            <Link className="text-link" to={`/m/demo-${mood}`}>
              See it through their eyes <Arrow />
            </Link>
          </div>
          <article className="recipient-letter" data-mood={mood}>
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
          </article>
        </section>
        <section className="desk-section use-section" aria-labelledby="uses-title">
          <div className="desk-heading">
            <h2 id="uses-title">
              For the things that
              <br />
              are hard to say.
            </h2>
          </div>
          <div className="use-fragments">
            {USES.map((title, index) => (
              <span className={`use-fragment fragment-${index + 1}`} key={title}>
                {title}
              </span>
            ))}
          </div>
        </section>
        <section className="desk-section final-letter-cta" aria-labelledby="final-title">
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
    </div>
  );
}
