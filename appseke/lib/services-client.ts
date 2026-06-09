import type { ApiErrorResponse } from "@/types/auth"
import type {
  CreateServiceRequest,
  CreateServiceResponse,
} from "@/types/service"

const EXTERNAL_API_BASE = process.env.NEXT_PUBLIC_URL_API?.trim()
const SERVICES_API = EXTERNAL_API_BASE
  ? `${EXTERNAL_API_BASE}/marketplace/services`
  : "/api/marketplace/services"

export type CreateServiceOutcome =
  | { success: true; data: CreateServiceResponse }
  | { success: false; error: string; statusCode?: number }

export async function createService(
  payload: CreateServiceRequest,
  token: string
): Promise<CreateServiceOutcome> {
  const res = await fetch(SERVICES_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = (await res.json().catch(() => ({}))) as
    | CreateServiceResponse
    | ApiErrorResponse

  if (!res.ok) {
    const message =
      "message" in data && typeof data.message === "string"
        ? data.message
        : "Não foi possível cadastrar o serviço."
    return {
      success: false,
      error: message,
      statusCode: res.status,
    }
  }

  return { success: true, data: data as CreateServiceResponse }
}
