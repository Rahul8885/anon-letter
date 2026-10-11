import type {
  ApiError,
  CreateMessageRequest,
  CreateMessageResponse,
  GetMessageResponse,
} from "@anonletter/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

/** `status` is null when the request never reached the server (offline, DNS, CORS). */
export class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
  }

  /** Worth retrying: the network or the server failed, not the request itself. */
  get retryable() {
    return this.status === null || this.status >= 500;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });
  } catch {
    throw new RequestError("We couldn’t reach Unsaid.", null);
  }
  let data: T | ApiError;
  try {
    data = (await response.json()) as T | ApiError;
  } catch {
    // not JSON: a proxy or gateway answered instead of the API, so treat it as a server fault
    throw new RequestError("Something went wrong on our side.", Math.max(response.status, 502));
  }

  if (!response.ok || (data as ApiError).success === false) {
    throw new RequestError(
      (data as ApiError).error || "Something went wrong on our side.",
      response.status,
    );
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
