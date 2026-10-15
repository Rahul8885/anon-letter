import type { TemplateId } from "@anonletter/shared";
import {
  type CSSProperties,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { LETTER_PALETTES, letterPaletteStyle, paperToneMatrix } from "../../lib/letterPalette";

/** The reader's sheet at rest is 700px wide; narrower columns zoom the whole sheet. */
const SHEET_WIDTH = 700;
/**
 * At phone widths the writer's phone shows the sheet's own narrow layout (the ≤760px rules),
 * which is exactly what a reader on a phone gets — so there it is shown as-is, never zoomed.
 */
const PHONE = "(max-width: 760px)";

/**
 * What the reader holds once the envelope is open — tinted stock, ink, measure — laid on the
 * reader's desk colour. In a column narrower than the sheet it is zoomed rather than reflowed,
 * so the writer sees the reader's own line breaks.
 */
export function LetterSheet({
  mood,
  children,
  style,
}: {
  mood: TemplateId;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const filterId = `sheet-stock-${useId().replace(/:/g, "")}`;
  const sizer = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [paperFailed, setPaperFailed] = useState(false);

  useLayoutEffect(() => {
    const el = sizer.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      const phone = window.matchMedia(PHONE).matches;
      setZoom(!phone && width > 0 && width < SHEET_WIDTH ? width / SHEET_WIDTH : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="preview-desk"
      data-mood={mood}
      style={{ ...letterPaletteStyle(mood), ...style }}
    >
      <svg
        className="ceremony-stock-filter"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={filterId} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={paperToneMatrix(LETTER_PALETTES[mood].paper)} />
          </filter>
        </defs>
      </svg>
      <div className="preview-desk-sizer" ref={sizer}>
        <div
          className="letter-sheet"
          data-mood={mood}
          data-fit={zoom ? "scaled" : "natural"}
          style={
            {
              "--letter-stock-filter": `url("#${filterId}")`,
              ...(zoom ? { zoom } : null),
            } as CSSProperties
          }
        >
          <div className="letter-sheet-paper" aria-hidden="true">
            <img
              src="/assets/letter-world/letter-paper.webp"
              alt=""
              hidden={paperFailed}
              onError={() => setPaperFailed(true)}
            />
          </div>
          <div className="letter-sheet-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
