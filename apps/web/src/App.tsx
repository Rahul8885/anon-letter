import { MotionConfig } from "framer-motion";
import { Link, Route, Routes } from "react-router-dom";
import { StaggeredText } from "./components/ui/StaggeredText";
import { useRouteScroll } from "./hooks/useRouteScroll";
import { Compose } from "./pages/Compose";
import { Home } from "./pages/Home";
import { Message } from "./pages/Message";
import { Preview } from "./pages/Preview";
import { Success } from "./pages/Success";

export function App() {
  useRouteScroll();

  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compose" element={<Compose />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/success/:slug" element={<Success />} />
        <Route path="/m/:slug" element={<Message />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MotionConfig>
  );
}

function NotFound() {
  return (
    <div className="state-page">
      <StaggeredText as="h1" className="t-h1" text="Nothing was sent here." play />
      <p className="measure-caption" style={{ color: "var(--text-dim)" }}>
        This address doesn&rsquo;t point at a letter. If someone sent you one, the link will have
        come by email or a shared link.
      </p>
      <div className="state-actions">
        <Link className="btn btn-primary" to="/compose">
          Write a letter
        </Link>
        <Link className="btn btn-secondary" to="/">
          Go to Unsaid
        </Link>
      </div>
    </div>
  );
}
