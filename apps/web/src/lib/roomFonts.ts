import type { TemplateId } from "@anonletter/shared";

/**
 * The five rooms' typefaces. Not in index.html: they are injected after the page has loaded so
 * they never compete with the hero for bandwidth, or immediately when a letter needs them first.
 */
const ROOM_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400;700&family=Inter:wght@300;400;500&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Archivo:wght@400;500;600&display=swap";

let sheet: Promise<void> | null = null;

/** Adds the room-font stylesheet once; resolves when it has applied (or failed). */
export function loadRoomFontSheet(): Promise<void> {
  if (sheet) return sheet;
  sheet = new Promise((resolve) => {
    if (typeof document === "undefined") return resolve();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = ROOM_FONTS_URL;
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener("error", () => resolve(), { once: true });
    document.head.appendChild(link);
  });
  return sheet;
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
  const ready = loadRoomFontSheet()
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
