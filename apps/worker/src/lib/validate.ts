import type { TemplateId } from "@anonletter/shared";
import { z } from "zod";

export const TEMPLATE_IDS: TemplateId[] = [
  "soft-bloom",
  "old-letter",
  "night-thought",
  "quiet-garden",
  "confetti-love"
];

export const CreateMessageSchema = z.object({
  template_id: z.enum(TEMPLATE_IDS as [TemplateId, ...TemplateId[]]),
  message: z.string().min(1, "Message cannot be empty").max(800, "Message exceeds 800 characters"),
  recipient_email: z.string().email("Invalid email address"),
  from_hint: z.string().max(60).optional(),
  bg_color: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  accent: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  font_key: z.string().max(40).optional()
});

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;
