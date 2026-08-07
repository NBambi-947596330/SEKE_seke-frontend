"use client"

import Image from "next/image"
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function imageNeedsUnoptimized(src: string): boolean {
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("//")
  )
}

function normalizeMediaSrc(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("/")) return trimmed
  if (trimmed.startsWith("data:")) return trimmed
  if (trimmed.startsWith("//")) return `https:${trimmed}`

  try {
    return new URL(trimmed).toString()
  } catch {
    if (!trimmed.includes(" ") && trimmed.includes(".")) {
      try {
        return new URL(`https://${trimmed}`).toString()
      } catch {
        return null
      }
    }
    return null
  }
}

export interface PostMediaGalleryProps {
  urls: string[]
  alt?: string
  className?: string
}

/**
 * Grelha de imagens estilo Facebook:
 * 1 → full; 2 → lado a lado; 3 → 1 grande + 2 empilhadas;
 * 4 → 2×2; 5+ → 2×2 com "+N" na última.
 */
export function PostMediaGallery({
  urls,
  alt = "Imagem da publicação",
  className,
}: PostMediaGalleryProps) {
  const images = urls
    .map(normalizeMediaSrc)
    .filter((u): u is string => Boolean(u))

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) =>
          i === null ? null : (i + 1) % images.length
        )
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) =>
          i === null ? null : (i - 1 + images.length) % images.length
        )
      }
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [lightboxIndex, images.length, closeLightbox])

  if (images.length === 0) return null

  const count = images.length
  const visibleCount = count > 4 ? 4 : count
  const overflow = count > 4 ? count - 4 : 0

  const openAt = (index: number) => setLightboxIndex(index)

  const cell = (
    src: string,
    index: number,
    cellClass: string,
    showOverflow = false
  ) => (
    <button
      key={`${src}-${index}`}
      type="button"
      onClick={() => openAt(index)}
      className={cn(
        "relative overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        cellClass
      )}
      aria-label={
        showOverflow && overflow > 0
          ? `Ver mais ${overflow} imagens`
          : `Ver imagem ${index + 1}`
      }
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 680px"
        className="object-cover"
        unoptimized={imageNeedsUnoptimized(src)}
      />
      {showOverflow && overflow > 0 ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white text-3xl font-semibold tabular-nums">
          +{overflow}
        </span>
      ) : null}
    </button>
  )

  let grid: ReactNode

  if (count === 1) {
    grid = (
      <div className="relative w-full aspect-video max-h-[min(560px,80vh)] min-h-[220px] bg-black">
        {cell(images[0], 0, "absolute inset-0")}
      </div>
    )
  } else if (count === 2) {
    grid = (
      <div className="grid grid-cols-2 gap-0.5 h-[min(420px,55vh)] min-h-[200px]">
        {cell(images[0], 0, "h-full w-full")}
        {cell(images[1], 1, "h-full w-full")}
      </div>
    )
  } else if (count === 3) {
    grid = (
      <div className="grid grid-cols-2 gap-0.5 h-[min(420px,55vh)] min-h-[220px]">
        {cell(images[0], 0, "row-span-2 h-full w-full")}
        <div className="grid grid-rows-2 gap-0.5 h-full min-h-0">
          {cell(images[1], 1, "h-full w-full min-h-0")}
          {cell(images[2], 2, "h-full w-full min-h-0")}
        </div>
      </div>
    )
  } else {
    grid = (
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-[min(460px,60vh)] min-h-[240px]">
        {Array.from({ length: visibleCount }, (_, i) =>
          cell(images[i], i, "h-full w-full", i === 3 && overflow > 0)
        )}
      </div>
    )
  }

  return (
    <>
      <div className={cn("w-full bg-black", className)}>{grid}</div>

      {lightboxIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de imagens"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
          {images.length > 1 ? (
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-sm text-white/80 tabular-nums">
              {lightboxIndex + 1} / {images.length}
            </span>
          ) : null}
          <div
            className="relative h-[min(85vh,900px)] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized={imageNeedsUnoptimized(images[lightboxIndex])}
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
