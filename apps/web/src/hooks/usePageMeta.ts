import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://unsaidletters.in";
const DEFAULT_TITLE = "Unsaid — for the things you couldn’t say out loud";

type Meta = { title: string; index: boolean; canonical?: string };

/** Private and transient routes stay out of search; only the house pages are indexable. */
function metaFor(pathname: string): Meta {
  if (pathname === "/") return { title: DEFAULT_TITLE, index: true, canonical: `${SITE}/` };
  if (pathname === "/compose")
    return {
      title: "Write an anonymous letter — Unsaid",
      index: true,
      canonical: `${SITE}/compose`,
    };
  if (pathname.startsWith("/m/")) return { title: "A letter for you — Unsaid", index: false };
  if (pathname.startsWith("/success/")) return { title: "Sent — Unsaid", index: false };
  if (pathname === "/preview") return { title: "Preview your letter — Unsaid", index: false };
  return { title: "Nothing was sent here — Unsaid", index: false };
}

function setMeta(selector: string, create: () => HTMLElement, attr: string, value: string | null) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (value === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = metaFor(pathname);
    document.title = meta.title;
    setMeta(
      'meta[name="robots"]',
      () => Object.assign(document.createElement("meta"), { name: "robots" }),
      "content",
      meta.index ? null : "noindex, nofollow",
    );
    setMeta(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement("link"), { rel: "canonical" }),
      "href",
      meta.canonical ?? null,
    );
  }, [pathname]);
}
