import type { TemplateId } from "@anonletter/shared";
import { z } from "zod";

export const TEMPLATE_IDS: TemplateId[] = [
  "soft-bloom",
  "old-letter",
  "night-thought",
  "quiet-garden",
  "confetti-love",
];

const hex = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i, "Colours must be 6-digit hex values")
  .transform((value) => value.toLowerCase());

// blank optional strings arrive as "" from some clients; treat them as absent
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .optional()
    .transform((value) => value || undefined);

export const CreateMessageSchema = z
  .object({
    template_id: z.enum(TEMPLATE_IDS as [TemplateId, ...TemplateId[]], {
      errorMap: () => ({ message: "Unknown template" }),
    }),
    message: z
      .string({ required_error: "Message cannot be empty" })
      .trim()
      .min(1, "Message cannot be empty")
      .max(800, "Message exceeds 800 characters"),
    delivery_method: z
      .enum(["email", "link"], { errorMap: () => ({ message: "Unknown delivery method" }) })
      .default("email"),
    recipient_email: z.string().trim().email("Invalid email address").max(254).optional(),
    from_hint: optionalText(60, "The signature"),
    bg_color: hex.optional(),
    accent: hex.optional(),
    font_key: optionalText(40, "The font key"),
  })
  .superRefine((input, ctx) => {
    if (input.delivery_method === "email" && !input.recipient_email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipient_email"],
        message: "Email is required for email delivery",
      });
    }
  });

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;

/** First issue only, as a sentence the composer can show as-is. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}
