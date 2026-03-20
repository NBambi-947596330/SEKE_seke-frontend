"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Briefcase,
  Heart,
  MessageCircle,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPostById } from "@/lib/posts-client"
import type { PostDetail } from "@/types/post"
import { cn } from "@/lib/utils"

function resolveAuthToken(accessToken: string | null | undefined): string | null {
  if (accessToken !== undefined) return accessToken
  if (typeof window === "undefined") return null
  return window.sessionStorage.getItem("auth_token")
}

function formatPostDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d)
  } catch {
    return iso
  }
}

function imageNeedsUnoptimized(src: string): boolean {
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("//")
  )
}

export interface ItemPostPublicacaoContentProps {
  post: PostDetail
  className?: string
}

/**
 * Vista de uma publicação já carregada (dados de GET /posts/:id).
 */
export function ItemPostPublicacaoContent({
  post,
  className,
}: ItemPostPublicacaoContentProps) {
  const avatarSrc = post.user.avatar?.trim() || ""
  const imageSrc = post.image?.trim() || ""
  const imageAlt =
    post.content.trim().slice(0, 100) || "Imagem da publicação"
  const liked = post.liked_by_me === true

  return (
    <Card className={cn("overflow-hidden border-border/80", className)}>
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-muted rounded-full overflow-hidden shrink-0">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={post.user.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                unoptimized={imageNeedsUnoptimized(avatarSrc)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <User size={20} />
              </div>
            )}
          </div>
          <div className="space-y-0.5 min-w-0">
            <Link
              href={`/detalhesuser?userId=${encodeURIComponent(post.user.id)}`}
              className="font-semibold text-sm hover:underline truncate block"
            >
              {post.user.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatPostDate(post.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full shrink-0">
          <Briefcase size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Profissional
          </span>
        </div>
      </CardHeader>

      {imageSrc ? (
        <div className="relative w-full aspect-video max-h-80 bg-muted">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 42rem"
            unoptimized={imageNeedsUnoptimized(imageSrc)}
          />
        </div>
      ) : null}

      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </CardContent>

      <CardFooter className="px-4 pb-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 bg-background/60">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 text-muted-foreground"
            title={liked ? "Gostou" : "Gostos"}
          >
            <Heart
              size={18}
              className={cn(
                "shrink-0",
                liked && "fill-red-500 text-red-500"
              )}
            />
            <span className="text-sm tabular-nums">{post.stats.likes}</span>
          </div>
          <div
            className="flex items-center gap-2 text-muted-foreground"
            title="Comentários"
          >
            <MessageCircle size={18} className="shrink-0" />
            <span className="text-sm tabular-nums">{post.stats.comments}</span>
          </div>
        </div>
        <Button size="sm" className="text-xs" asChild>
          <Link href={`/detalhesuser?userId=${encodeURIComponent(post.user.id)}`}>
            Contactar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function PostPublicacaoSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 flex flex-row justify-between gap-3">
        <div className="flex gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </CardHeader>
      <Skeleton className="w-full aspect-video rounded-none" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export interface ItemPostPublicacaoProps {
  postId: string
  className?: string
  /** Token Bearer; se omitido, usa `sessionStorage.auth_token` no cliente */
  accessToken?: string | null
}

/**
 * Carrega e exibe uma publicação (GET /api/posts/:id → proxy para GET /posts/:id).
 */
export function ItemPostPublicacao({
  postId,
  className,
  accessToken,
}: ItemPostPublicacaoProps) {
  const [post, setPost] = useState<PostDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const result = await fetchPostById(
        postId,
        resolveAuthToken(accessToken)
      )
      if (cancelled) return
      if (result.success) {
        setPost(result.data)
        setError(null)
      } else {
        setPost(null)
        setError(result.error)
      }
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [postId, accessToken])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    void (async () => {
      const result = await fetchPostById(
        postId,
        resolveAuthToken(accessToken)
      )
      if (result.success) {
        setPost(result.data)
        setError(null)
      } else {
        setPost(null)
        setError(result.error)
      }
      setLoading(false)
    })()
  }

  if (loading) {
    return (
      <div className={className}>
        <PostPublicacaoSkeleton />
      </div>
    )
  }

  if (error || !post) {
    return (
      <Card className={cn("p-6 border-destructive/30", className)}>
        <p className="text-sm text-destructive mb-3">
          {error ?? "Não foi possível carregar a publicação."}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
          Tentar novamente
        </Button>
      </Card>
    )
  }

  return <ItemPostPublicacaoContent post={post} className={className} />
}

export default ItemPostPublicacao
