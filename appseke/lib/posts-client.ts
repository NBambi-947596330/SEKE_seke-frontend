import type { ApiErrorResponse } from "@/types/auth"
import type {
  CreatePostRequest,
  CreatePostResponse,
  PostDetail,
} from "@/types/post"

const POSTS_API = "/api/posts"

export type CreatePostOutcome =
  | { success: true; data: CreatePostResponse }
  | { success: false; error: string; statusCode?: number }

/**
 * Cria uma publicação (texto + imagem opcional em base64/data URL).
 * Usa o token em sessionStorage (mesmo fluxo do login por credenciais).
 */
export async function createPost(
  payload: CreatePostRequest,
  token: string
): Promise<CreatePostOutcome> {
  const res = await fetch(POSTS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content: payload.content,
      ...(payload.image ? { image: payload.image } : {}),
    }),
  })

  const data = (await res.json().catch(() => ({}))) as
    | CreatePostResponse
    | ApiErrorResponse

  if (!res.ok) {
    const message =
      "message" in data && typeof data.message === "string"
        ? data.message
        : "Não foi possível publicar. Tente novamente."
    return {
      success: false,
      error: message,
      statusCode: res.status,
    }
  }

  if (!("post" in data) || data.post == null) {
    return {
      success: false,
      error: "Resposta inválida do servidor.",
      statusCode: res.status,
    }
  }

  return {
    success: true,
    data: data as CreatePostResponse,
  }
}

export type GetPostOutcome =
  | { success: true; data: PostDetail }
  | { success: false; error: string; statusCode?: number }

function parseNumberField(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  return null
}

/** Aceita JSON plano ou `{ post: {...} }` e normaliza tipos da API */
function parsePostDetail(raw: unknown): PostDetail | null {
  if (!raw || typeof raw !== "object") return null
  let o = raw as Record<string, unknown>
  if (o.post && typeof o.post === "object") {
    o = o.post as Record<string, unknown>
  }

  if (typeof o.id !== "string" || typeof o.content !== "string") return null
  if (typeof o.created_at !== "string") return null

  if (!o.user || typeof o.user !== "object") return null
  const u = o.user as Record<string, unknown>
  if (typeof u.id !== "string" || typeof u.name !== "string") return null

  if (!o.stats || typeof o.stats !== "object") return null
  const s = o.stats as Record<string, unknown>
  const likes = parseNumberField(s.likes)
  const comments = parseNumberField(s.comments)
  if (likes === null || comments === null) return null

  const image =
    o.image === null || o.image === undefined
      ? null
      : typeof o.image === "string"
        ? o.image
        : null

  const detail: PostDetail = {
    id: o.id,
    content: o.content,
    created_at: o.created_at,
    image,
    user: {
      id: u.id,
      name: u.name,
      avatar:
        u.avatar === null || u.avatar === undefined
          ? null
          : typeof u.avatar === "string"
            ? u.avatar
            : null,
    },
    stats: { likes, comments },
  }

  if (typeof o.liked_by_me === "boolean") {
    detail.liked_by_me = o.liked_by_me
  }

  return detail
}

/**
 * GET /api/posts/:id — token opcional (para `liked_by_me` e dados de sessão).
 */
export async function fetchPostById(
  postId: string,
  token?: string | null
): Promise<GetPostOutcome> {
  const headers: HeadersInit = {
    Accept: "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(
    `${POSTS_API}/${encodeURIComponent(postId)}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  )

  const raw = await res.json().catch(() => ({}))

  if (!res.ok) {
    const data = raw as ApiErrorResponse
    const message =
      typeof data.message === "string"
        ? data.message
        : "Não foi possível carregar a publicação."
    return {
      success: false,
      error: message,
      statusCode: res.status,
    }
  }

  const parsed = parsePostDetail(raw)
  if (!parsed) {
    return {
      success: false,
      error: "Resposta inválida do servidor.",
      statusCode: res.status,
    }
  }

  return {
    success: true,
    data: parsed,
  }
}
