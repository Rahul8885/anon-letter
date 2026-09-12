import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useComposerStore } from "../store/composerStore";
import { Reveal } from "./Message";

/** Uses the actual receiver ceremony with local draft data; never calls the API. */
export function Preview() {
  const draft = useComposerStore();
  const [replay, setReplay] = useState(0);
  const [createdAt] = useState(() => Math.floor(Date.now() / 1000));

  if (!draft.message.trim()) {
    return (
      <main className="state-page">
        <h1 className="t-h1">Your words come first.</h1>
        <p>Write a letter, then preview how it opens.</p>
        <Link className="btn btn-primary" to="/compose">
          Back to your draft
        </Link>
      </main>
    );
  }

  return (
    <main className="receiver-preview">
      <header className="preview-toolbar" data-preview-controls>
        <div>
          <strong>Recipient preview</strong>
          <p>Only you can see this. Nothing has been sent.</p>
        </div>
        <nav aria-label="Preview controls">
          <Button
            variant="secondary"
            magnetic={false}
            onClick={() => {
              window.scrollTo(0, 0);
              setReplay((value) => value + 1);
            }}
          >
            Replay opening
          </Button>
          <Link className="btn btn-primary" to="/compose">
            Back to your draft
          </Link>
        </nav>
      </header>
      <Reveal
        key={replay}
        preview
        data={{
          slug: "preview",
          template_id: draft.mood,
          message: draft.message.trim(),
          from_hint: draft.fromHint.trim() || null,
          accent: draft.accent,
          bg_color: null,
          font_key: null,
          status: "sent",
          read_at: null,
          created_at: createdAt,
          expires_at: createdAt + 30 * 86400,
        }}
      />
    </main>
  );
}
