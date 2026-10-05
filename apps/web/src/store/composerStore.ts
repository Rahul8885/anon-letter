import type { TemplateId } from "@anonletter/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  /** After a send: the words are gone, the room stays for the success page. */
  finish: () => void;
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

/**
 * The draft survives a refresh in this tab only (sessionStorage), and never includes the
 * recipient's address — that is held in memory for delivery and nowhere else.
 */
export const useComposerStore = create<ComposerState>()(
  persist(
    (set) => ({
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
      finish: () => set((s) => ({ ...initial, mood: s.mood, deliveryMethod: s.deliveryMethod })),
      reset: () => set(initial),
    }),
    {
      name: "sayless-draft",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        // the address isn't kept, so a refresh on review returns to the delivery step
        step: Math.min(s.step, 3) as Step,
        mood: s.mood,
        message: s.message,
        fromHint: s.fromHint,
        deliveryMethod: s.deliveryMethod,
        accent: s.accent,
      }),
    },
  ),
);
