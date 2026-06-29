import type { Message as MessageData } from "@anonletter/shared";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { typeMessage } from "../lib/typewriter";

const demo: Omit<MessageData, "id"> = {
  slug: "demo",
  template_id: "night-thought",
  message:
    "There are things I have wanted to say to you for longer than I can remember. Not because the words were missing, but because saying them out loud felt like too much.\n\nSo I wrote this instead.\n\nSomeone notices the way you keep showing up.",
  from_hint: "someone who wanted you to know",
  bg_color: null,
  accent: null,
  font_key: null,
  status: "sent",
  read_at: null,
  expires_at: Date.now() + 100000,
  created_at: Date.now()
};

export function Message() {
  const { slug } = useParams();
  const [data, setData] = useState<Omit<MessageData, "id"> | null>(slug === "demo" ? demo : null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(slug !== "demo");

  useEffect(() => {
    if (!slug || slug === "demo") return;
    api
      .getMessage(slug)
      .then((result) => setData(result.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Letter not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LetterLoading />;
  if (error) return <LetterError message={error} />;
  if (!data) return null;

  return <NightThoughtLetter data={data} />;
}

function NightThoughtLetter({ data }: { data: Omit<MessageData, "id"> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.25,
      a: Math.random() * 0.65 + 0.1,
      phase: Math.random() * Math.PI * 2
    }));

    function resize() {
      cv.width = window.innerWidth * window.devicePixelRatio;
      cv.height = window.innerHeight * window.devicePixelRatio;
    }

    function draw(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const star of stars) {
        const alpha = star.a * (0.7 + 0.3 * Math.sin(time * 0.001 + star.phase));
        ctx.beginPath();
        ctx.arc(star.x * cv.width, star.y * cv.height, star.r * window.devicePixelRatio, 0, 7);
        ctx.fillStyle = `rgba(210,215,255,${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw(0);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReady(true);
      if (text.current) {
        typeMessage(text.current, data.message, () => {
          text.current?.classList.add("done");
          setDone(true);
        });
      }
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [data.message]);

  return (
    <main className="message-shell">
      <canvas ref={canvas} className="stars-canvas" />
      <div className={`entry-envelope ${ready ? "opened" : ""}`} aria-hidden="true">
        <div className="envelope-body">
          <div className="envelope-flap" />
          <div className="wax-seal">A</div>
        </div>
      </div>
      <article className={`message-card ${ready ? "visible" : ""}`}>
        <p className="received-notice">Received just now</p>
        <p className="letter-greeting">For you</p>
        <p className="message-body">
          <span ref={text} />
        </p>
        <div className={`letter-divider ${done ? "show" : ""}`} />
        <p className={`message-from ${done ? "show" : ""}`}>
          from {data.from_hint || "someone anonymous"}
        </p>
      </article>
      <footer className={`message-footer ${done ? "show" : ""}`}>
        <span>This letter was written for you.</span>
        <Link to="/compose">Send your own</Link>
      </footer>
      <button
        className={`report-button ${done ? "show" : ""}`}
        onClick={() => data.slug && api.reportMessage(data.slug)}
      >
        Report
      </button>
    </main>
  );
}

function LetterLoading() {
  return (
    <main className="letter-state">
      <div className="skeleton-lines">
        <span />
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}

function LetterError({ message }: { message: string }) {
  return (
    <main className="letter-state">
      <h1>This letter could not be opened.</h1>
      <p>{message}</p>
      <Link to="/">
        <Button>Go home</Button>
      </Link>
    </main>
  );
}
