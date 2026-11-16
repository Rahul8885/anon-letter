import { useEffect, useState } from "react";
import { afterPageLoad } from "../lib/images";

/** True once the window `load` event has fired — for bytes that must not compete with the LCP image. */
export function useAfterPageLoad() {
  const [ready, setReady] = useState(() => document.readyState === "complete");
  useEffect(() => {
    if (!ready) afterPageLoad(() => setReady(true));
  }, [ready]);
  return ready;
}
