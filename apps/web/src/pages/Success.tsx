import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function Success() {
  const { slug } = useParams();
  const url = `${window.location.origin}/m/${slug ?? ""}`;

  return (
    <main className="success-shell">
      <div className="success-envelope" aria-hidden="true">
        <div className="success-seal">A</div>
      </div>
      <p className="section-label">Sent</p>
      <h1>The letter is on its way.</h1>
      <p>
        The recipient email was used for delivery only. The public message link is ready if you
        need it.
      </p>
      <code>{url}</code>
      <div className="hero-actions">
        <Link to="/compose">
          <Button>Write another</Button>
        </Link>
        <Link to="/">
          <Button variant="secondary">Home</Button>
        </Link>
      </div>
    </main>
  );
}
