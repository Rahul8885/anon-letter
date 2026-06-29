export function typeMessage(el: HTMLElement, text: string, onDone?: () => void) {
  let i = 0;
  el.textContent = "";

  function next() {
    if (i >= text.length) {
      onDone?.();
      return;
    }

    const ch = text[i];
    let delay = 28 + Math.random() * 38;
    if (ch === ".") delay += 220;
    if (ch === ",") delay += 100;
    if (ch === "\n") delay += 160;
    if (ch === "!") delay += 180;
    if (ch === "?") delay += 200;
    el.textContent += ch;
    i++;
    window.setTimeout(next, delay);
  }

  window.setTimeout(next, 300);
}
