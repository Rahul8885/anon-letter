import type {
  ApiError,
  CreateMessageRequest,
  CreateMessageResponse,
  GetMessageResponse,
} from "@anonletter/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const data = (await response.json()) as T | ApiError;

  if (!response.ok || (data as ApiError).success === false) {
    throw new Error((data as ApiError).error || "Request failed");
  }

  return data as T;
}

export const api = {
  createMessage(input: CreateMessageRequest) {
    return request<CreateMessageResponse>("/messages", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  getMessage(slug: string) {
    return request<GetMessageResponse>(`/messages/${slug}`);
  },
  reportMessage(slug: string) {
    return request<{ success: true }>(`/messages/${slug}/report`, { method: "POST" });
  },
};
