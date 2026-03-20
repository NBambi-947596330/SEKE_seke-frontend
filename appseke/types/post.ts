/** Corpo enviado em POST /api/posts */
export interface CreatePostRequest {
  content: string
  /** Opcional: URL, base64 ou data URL, conforme a API */
  image?: string
}

/** Resposta de sucesso { post } */
export interface CreatePostResponse {
  post: PostRecord
}

/** Forma mínima do post devolvido pela API (campos extra permitidos) */
export interface PostRecord {
  id?: string
  content?: string
  image?: string | null
  createdAt?: string
  userId?: string
  [key: string]: unknown
}

/** Utilizador associado a uma publicação (GET /posts/:id) */
export interface PostDetailUser {
  id: string
  name: string
  avatar?: string | null
}

/** Estatísticas da publicação */
export interface PostDetailStats {
  likes: number
  comments: number
}

/**
 * Resposta de GET /posts/:id
 * (nomes em snake_case conforme a API)
 */
export interface PostDetail {
  id: string
  content: string
  image?: string | null
  created_at: string
  user: PostDetailUser
  stats: PostDetailStats
  /** Presente quando o pedido envia Authorization */
  liked_by_me?: boolean
}
