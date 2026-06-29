import type { TemplateId } from "@anonletter/shared";
import { create } from "zustand";

interface ComposerState {
  step: number;
  selectedTemplate: TemplateId;
  message: string;
  recipientEmail: string;
  fromHint: string;
  isSubmitting: boolean;
  submitError: string | null;
  sentSlug: string | null;
  setStep: (step: number) => void;
  setSelectedTemplate: (template: TemplateId) => void;
  setMessage: (message: string) => void;
  setRecipientEmail: (email: string) => void;
  setFromHint: (hint: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmitError: (error: string | null) => void;
  setSentSlug: (slug: string | null) => void;
}

export const useComposerStore = create<ComposerState>((set) => ({
  step: 1,
  selectedTemplate: "night-thought",
  message: "",
  recipientEmail: "",
  fromHint: "",
  isSubmitting: false,
  submitError: null,
  sentSlug: null,
  setStep: (step) => set({ step }),
  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
  setMessage: (message) => set({ message }),
  setRecipientEmail: (recipientEmail) => set({ recipientEmail }),
  setFromHint: (fromHint) => set({ fromHint }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSubmitError: (submitError) => set({ submitError }),
  setSentSlug: (sentSlug) => set({ sentSlug })
}));
