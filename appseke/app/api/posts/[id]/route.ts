import { NextRequest, NextResponse } from "next/server"
import type { ApiErrorResponse } from "@/types/auth"

const getBaseUrl = (): string => {
  const url = process.env.URL_API?.trim()
  if (!url) {
    throw new Error("URL_API não configurada no .env")
  }
  return url
}

/** GET /api/posts/:id — proxy para GET /posts/:id na API externa */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const trimmed = id?.trim()
    if (!trimmed) {
      return NextResponse.json(
        { message: "ID da publicação inválido." } satisfies ApiErrorResponse,
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/posts/${encodeURIComponent(trimmed)}`

    const authorization = request.headers.get("authorization")
    const headers: HeadersInit = {
      Accept: "application/json",
    }
    if (authorization?.toLowerCase().startsWith("bearer ")) {
      headers.Authorization = authorization
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const message =
        (data && typeof data.message === "string" && data.message) ||
        "Publicação não encontrada."

      return NextResponse.json(
        { message } satisfies ApiErrorResponse,
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof Error && err.message.includes("URL_API")) {
      return NextResponse.json(
        { message: "Configuração do servidor incompleta." } satisfies ApiErrorResponse,
        { status: 503 }
      )
    }

    return NextResponse.json(
      { message: "Erro interno ao carregar a publicação." } satisfies ApiErrorResponse,
      { status: 500 }
    )
  }
}
