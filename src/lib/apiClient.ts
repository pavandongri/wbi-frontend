export type ApiErrorPayload = {
  message?: string;
  [key: string]: any;
};

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export type ApiClientRequestOptions = Omit<RequestInit, "method" | "body" | "headers"> & {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
};

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }
  return baseUrl.replace(/\/+$/, "");
}

function isJsonBody(body: unknown): body is Record<string, unknown> | unknown[] {
  if (body === null || body === undefined) return false;
  if (typeof body === "string") return false;
  if (body instanceof FormData) return false;
  if (body instanceof URLSearchParams) return false;
  return typeof body === "object";
}

export async function apiClient<TResponse>(
  path: string,
  options: ApiClientRequestOptions = {}
): Promise<TResponse> {
  const { method = "GET", body, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    if (isJsonBody(body) || Array.isArray(body)) {
      if (!finalHeaders.has("Content-Type")) {
        finalHeaders.set("Content-Type", "application/json");
      }
      requestBody = JSON.stringify(body);
    } else {
      requestBody = body as unknown as BodyInit;
    }
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${getApiBaseUrl()}${normalizedPath}`;

  const res = await fetch(url, {
    ...rest,
    method,
    headers: finalHeaders,
    body: requestBody,
    credentials: "include"
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const payload = isJson
    ? await res.json().catch(() => undefined)
    : await res.text().catch(() => undefined);

  if (!res.ok) {
    const message =
      isJson && payload && typeof payload === "object"
        ? (payload as ApiErrorPayload).message
        : undefined;
    throw new ApiError(res.status, message || `Request failed with status ${res.status}`, payload);
  }

  return payload as TResponse;
}
