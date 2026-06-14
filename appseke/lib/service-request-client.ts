import type { ApiErrorResponse } from "@/types/auth"
import type {
  CreateServiceRequestPayload,
  MarketplaceServiceRequest,
  MarketplaceServiceRequestsResponse,
} from "@/types/service-request"

const EXTERNAL_API_BASE = process.env.NEXT_PUBLIC_URL_API?.trim()
const SERVICE_REQUESTS_API = EXTERNAL_API_BASE
  ? `${EXTERNAL_API_BASE}/marketplace/service-requests`
  : "/api/marketplace/service-requests"

type Outcome<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number }

function isServiceRequest(item: unknown): item is MarketplaceServiceRequest {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as MarketplaceServiceRequest).id === "string" &&
    typeof (item as MarketplaceServiceRequest).title === "string"
  )
}

export type FetchServiceRequestsOutcome = Outcome<{
  requests: MarketplaceServiceRequest[]
  pagination: MarketplaceServiceRequestsResponse["pagination"]
}>

export async function fetchServiceRequests(options?: {
  page?: number
  limit?: number
  token?: string
}): Promise<FetchServiceRequestsOutcome> {
  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  const headers: HeadersInit = { Accept: "application/json" }
  if (options?.token?.trim()) {
    headers.Authorization = `Bearer ${options.token.trim()}`
  }

  const res = await fetch(`${SERVICE_REQUESTS_API}?${params}`, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  const raw = (await res.json().catch(() => ({}))) as
    | MarketplaceServiceRequestsResponse
    | ApiErrorResponse

  if (!res.ok) {
    const message =
      "message" in raw && typeof raw.message === "string"
        ? raw.message
        : "Não foi possível carregar as solicitações."
    return { success: false, error: message, statusCode: res.status }
  }

  const data = raw as MarketplaceServiceRequestsResponse
  const requests = Array.isArray(data.data)
    ? data.data.filter(isServiceRequest)
    : []

  return {
    success: true,
    data: { requests, pagination: data.pagination },
  }
}

export type CreateServiceRequestOutcome = Outcome<MarketplaceServiceRequest>

export async function createServiceRequest(
  payload: CreateServiceRequestPayload,
  token: string
): Promise<CreateServiceRequestOutcome> {
  const res = await fetch(SERVICE_REQUESTS_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const raw = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      raw &&
      typeof raw === "object" &&
      "message" in raw &&
      typeof (raw as ApiErrorResponse).message === "string"
        ? (raw as ApiErrorResponse).message
        : "Não foi possível criar a solicitação."
    return { success: false, error: message, statusCode: res.status }
  }

  const root = raw as Record<string, unknown>
  const nested =
    root.data && typeof root.data === "object"
      ? (root.data as MarketplaceServiceRequest)
      : null
  const item = nested && isServiceRequest(nested) ? nested : null

  if (!item) {
    return { success: false, error: "Resposta inválida do servidor." }
  }

  return { success: true, data: item }
}
