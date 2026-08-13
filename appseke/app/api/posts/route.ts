import { NextRequest, NextResponse } from "next/server"
import type { ApiErrorResponse } from "@/types/auth"
import {
  buildExternalCreatePostBody,
  extractHashtagsFromContent,
  normalizeHashtagLabel,
} from "@/lib/posts-client"
import type { CreatePostRequest } from "@/types/post"

const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_URL_API?.trim()
  if (!url) {
    throw new Error("NEXT_PUBLIC_URL_API não configurada no .env")
  }
  return url.replace(/\/+$/, "")
}

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

/** POST /api/posts — proxy para POST …/posts na API externa */
export async function POST(request: NextRequest) {
  try {
    const baseUrl = getBaseUrl()
    const postsEndpoint = `${baseUrl}/posts`

    const authorization = request.headers.get("authorization")

    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json(
        {
          message: "Token de autorização ausente ou inválido.",
        } satisfies ApiErrorResponse,
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => null) as
      | (CreatePostRequest & { content_text?: string })
      | null

    if (!body) {
      return NextResponse.json(
        { message: "Payload inválido para criação de publicação." } satisfies ApiErrorResponse,
        { status: 400 }
      )
    }

    const content =
      toNonEmptyString(body.content_text) ?? toNonEmptyString(body.content)
    if (!content) {
      return NextResponse.json(
        { message: "O conteúdo da publicação é obrigatório." } satisfies ApiErrorResponse,
        { status: 400 }
      )
    }

    const payload: CreatePostRequest = {
      content,
      visibility:
        body.visibility === "private" ||
        body.visibility === "followers" ||
        body.visibility === "public"
          ? body.visibility
          : "public",
      hashtags: Array.isArray(body.hashtags)
        ? body.hashtags
            .filter(
              (tag): tag is string => typeof tag === "string" && tag.trim() !== ""
            )
            .map(normalizeHashtagLabel)
            .filter((tag) => tag.length > 0)
        : extractHashtagsFromContent(content).map(normalizeHashtagLabel),
    }

    const externalPayload = buildExternalCreatePostBody(payload)

    const res = await fetch(postsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify(externalPayload),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const message =
        (data && typeof data.message === "string" && data.message) ||
        (data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string" &&
          (data as { error: string }).error) ||
        "Não foi possível criar a publicação."

      return NextResponse.json(
        { message } satisfies ApiErrorResponse,
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_PUBLIC_URL_API")) {
      return NextResponse.json(
        { message: "Configuração do servidor incompleta." } satisfies ApiErrorResponse,
        { status: 503 }
      )
    }

    return NextResponse.json(
      { message: "Erro interno ao criar publicação." } satisfies ApiErrorResponse,
      { status: 500 }
    )
  }
}
