export type TemplateId =
  | "soft-bloom"
  | "old-letter"
  | "night-thought"
  | "quiet-garden"
  | "confetti-love";

export type MessageStatus = "sent" | "read" | "reported" | "expired";

export interface Template {
  id: TemplateId;
  name: string;
  tags: string[];
  palette: {
    bg: string;
    accent: string;
    text: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  motif: string;
}

export interface Message {
  id: string;
  slug: string;
  template_id: TemplateId;
  message: string;
  /** The writer's own heading. Null keeps the room's default. */
  heading: string | null;
  from_hint: string | null;
  bg_color: string | null;
  accent: string | null;
  font_key: string | null;
  status: MessageStatus;
  read_at: number | null;
  expires_at: number;
  created_at: number;
}

export interface CreateMessageRequest {
  template_id: TemplateId;
  message: string;
  /** Email is the default; link delivery never contacts an email provider. */
  delivery_method?: "email" | "link";
  recipient_email?: string;
  heading?: string;
  from_hint?: string;
  bg_color?: string;
  accent?: string;
  font_key?: string;
}

export interface CreateMessageResponse {
  success: true;
  slug: string;
  message_url: string;
  /**
   * Email delivery only. "failed" means the letter was stored but the inbox refused it —
   * the writer gets the link to share themselves. Absent for link delivery.
   */
  email_delivery?: "sent" | "failed";
}

export interface GetMessageResponse {
  success: true;
  data: Omit<Message, "id">;
}

export interface ApiError {
  success: false;
  error: string;
  code: "RATE_LIMITED" | "NOT_FOUND" | "EXPIRED" | "VALIDATION_ERROR" | "INTERNAL_ERROR";
}
