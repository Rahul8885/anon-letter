import { TEMPLATES, type TemplateId } from "@anonletter/shared";
import type { CSSProperties } from "react";

export function LivePreview({
  templateId,
  message,
  fromHint
}: {
  templateId: TemplateId;
  message: string;
  fromHint?: string;
}) {
  const template = TEMPLATES[templateId];

  return (
    <article
      className="live-preview"
      style={
        {
          "--preview-bg": template.palette.bg,
          "--preview-accent": template.palette.accent,
          "--preview-text": template.palette.text
        } as CSSProperties
      }
    >
      <span className="preview-motif">{template.motif}</span>
      <p className="preview-kicker">For you</p>
      <p className="preview-message">
        {message || "Write the sentence you have been carrying. The preview will hold it here."}
      </p>
      <p className="preview-from">from {fromHint || "someone"}</p>
    </article>
  );
}
