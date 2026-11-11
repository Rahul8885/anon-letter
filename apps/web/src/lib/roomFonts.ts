import type { TemplateId } from "@anonletter/shared";

const SHEET_SELECTOR = "link[data-room-fonts]";

/** Resolves once the non-blocking Google Fonts stylesheet has applied (or immediately if it already has). */
function whenSheetApplied(): Promise<void> {
  const link = document.querySelector<HTMLLinkElement>(SHEET_SELECTOR);
  if (!link || link.media === "all") return Promise.resolve();
  return new Promise((resolve) => {
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener("error", () => resolve(), { once: true });
  });
}

/** Reads the room's display/body families from the same tokens the CSS uses, so there is one source of truth. */
function roomFamilies(mood: TemplateId): string[] {
  const probe = document.createElement("div");
  probe.dataset.mood = mood;
  probe.hidden = true;
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const families = ["--room-display", "--room-body"]
    .map((token) => style.getPropertyValue(token).split(",")[0]?.trim())
    .filter((family): family is string => Boolean(family));
  probe.remove();
  return families;
}

/**
 * Waits for a room's typefaces so the letter never re-sets itself mid-reveal.
 * Capped: the ceremony is never a hostage, so a slow font network falls back after `timeout`.
 */
export function whenRoomFontsReady(mood: TemplateId, timeout = 1200): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return Promise.resolve();
  const ready = whenSheetApplied()
    .then(() =>
      Promise.all(
        roomFamilies(mood).flatMap((family) => [
          document.fonts.load(`400 1em ${family}`),
          document.fonts.load(`italic 400 1em ${family}`),
        ]),
      ),
    )
    .then(() => undefined)
    .catch(() => undefined);
  return Promise.race([ready, new Promise<void>((resolve) => setTimeout(resolve, timeout))]);
}
