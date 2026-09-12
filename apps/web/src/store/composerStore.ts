import type { TemplateId } from "@anonletter/shared";
import { create } from "zustand";

export type Step = 1 | 2 | 3 | 4;

interface ComposerState {
  step: Step;
  mood: TemplateId;
  message: string;
  fromHint: string;
  recipientEmail: string;
  deliveryMethod: "email" | "link";
  /** Accent override. Null keeps the room's own accent. */
  accent: string | null;
  isSubmitting: boolean;
  submitError: string | null;

  setStep: (step: Step) => void;
  next: () => void;
  back: () => void;
  setMood: (mood: TemplateId) => void;
  setMessage: (message: string) => void;
  setFromHint: (hint: string) => void;
  setRecipientEmail: (email: string) => void;
  setDeliveryMethod: (method: "email" | "link") => void;
  setAccent: (accent: string | null) => void;
  setSubmitting: (value: boolean) => void;
  setSubmitError: (error: string | null) => void;
  reset: () => void;
}

const initial = {
  step: 1 as Step,
  mood: "night-thought" as TemplateId,
  message: "",
  fromHint: "",
  recipientEmail: "",
  deliveryMethod: "email" as "email" | "link",
  accent: null,
  isSubmitting: false,
  submitError: null,
};

export const useComposerStore = create<ComposerState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  next: () => set((s) => ({ step: Math.min(4, s.step + 1) as Step })),
  back: () => set((s) => ({ step: Math.max(1, s.step - 1) as Step })),
  // switching mood never touches the message — the words stay, the room changes
  setMood: (mood) => set({ mood, accent: null }),
  setMessage: (message) => set({ message }),
  setFromHint: (fromHint) => set({ fromHint }),
  setRecipientEmail: (recipientEmail) => set({ recipientEmail }),
  setDeliveryMethod: (deliveryMethod) => set({ deliveryMethod }),
  setAccent: (accent) => set({ accent }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSubmitError: (submitError) => set({ submitError }),
  reset: () => set(initial),
}));
