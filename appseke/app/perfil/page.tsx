"use client"

import { useAuth } from "@/lib/use-auth"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Briefcase,
  MapPin,
  BarChart2,
  Share2,
  Pencil,
  FileText,
  ChevronDown,
  MessageSquare,
  UserRound,
  Goal,
  Phone,
  GraduationCap,
  Flag,
  Building2,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Send,
  MessageCircle,
  Music2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toaster"
import { getStoredUserId } from "@/lib/viewer-user-id"
import { resolveUserAvatarUrl, userAvatarSrcUnoptimized } from "@/lib/user-avatar"
import {
  NetworkListSkeleton,
  ProfileLayoutSkeleton,
} from "@/components/profile/profile-layout-skeleton"

interface PerfilUser {
  id?: number | string
  name?: string
  email?: string
  username?: string
  avatar?: string
  image?: string
}

interface PerfilInfo {
  profile_type?: string
  bio?: string
  objective?: string | null
  phone?: string[]
  birth_date?: string | null
  grade?: string | null
  nationality?: string | null
  city?: string | null
  interest?: string | null
  social_link?: string | null
  web_url?: string[]
  cove_image?: string | null
  location?: string
  member_since?: string
}

interface ProfileFormState {
  name: string
  bio: string
  avatar: string
  profile_type: string
  objective: string
  phone: string
  birth_date: string
  grade: string
  nationality: string
  city: string
  interest: string
  social_link: string
  web_url: string
  cove_image: string
  location: string
}

function pickPerfilInfoFromUnknown(raw: unknown): Partial<PerfilInfo> | null {
  if (!raw || typeof raw !== "object") return null
  const root = raw as Record<string, unknown>
  const o =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root

  const picked: Partial<PerfilInfo> = {}
  if (typeof o.profile_type === "string") picked.profile_type = o.profile_type
  if (typeof o.bio === "string") picked.bio = o.bio
  if (typeof o.objective === "string" || o.objective == null) {
    picked.objective = (o.objective as string | null) ?? null
  }
  if (Array.isArray(o.phone)) {
    picked.phone = o.phone.filter((x): x is string => typeof x === "string")
  }
  if (typeof o.birth_date === "string" || o.birth_date == null) {
    picked.birth_date = (o.birth_date as string | null) ?? null
  }
  if (typeof o.grade === "string" || o.grade == null) {
    picked.grade = (o.grade as string | null) ?? null
  }
  if (typeof o.nationality === "string" || o.nationality == null) {
    picked.nationality = (o.nationality as string | null) ?? null
  }
  if (typeof o.city === "string" || o.city == null) {
    picked.city = (o.city as string | null) ?? null
  }
  if (typeof o.interest === "string" || o.interest == null) {
    picked.interest = (o.interest as string | null) ?? null
  }
  if (typeof o.social_link === "string" || o.social_link == null) {
    picked.social_link = (o.social_link as string | null) ?? null
  }
  if (Array.isArray(o.web_url)) {
    picked.web_url = o.web_url.filter((x): x is string => typeof x === "string")
  }
  if (typeof o.cove_image === "string" || o.cove_image == null) {
    picked.cove_image = (o.cove_image as string | null) ?? null
  }
  if (typeof o.location === "string") picked.location = o.location
  if (typeof o.member_since === "string") picked.member_since = o.member_since

  return Object.keys(picked).length > 0 ? picked : null
}

function parseCommaSeparatedList(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function normalizeExternalUrl(raw: string): string | null {
  const input = raw.trim()
  if (!input) return null
  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`
  try {
    const parsed = new URL(withProtocol)
    return parsed.toString()
  } catch {
    return null
  }
}

function compactLinkLabel(raw: string): string {
  const cleaned = raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
  if (cleaned.length <= 14) return cleaned
  return `${cleaned.slice(0, 14)}...`
}

function detectSocialNetworkKey(raw: string):
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "x"
  | "youtube"
  | "whatsapp"
  | "telegram"
  | "other" {
  const normalized = normalizeExternalUrl(raw)
  if (!normalized) return "other"
  const host = new URL(normalized).hostname.toLowerCase()
  if (host.includes("instagram.com")) return "instagram"
  if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook"
  if (host.includes("linkedin.com")) return "linkedin"
  if (host.includes("tiktok.com")) return "tiktok"
  if (host.includes("x.com") || host.includes("twitter.com")) return "x"
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube"
  if (host.includes("whatsapp.com") || host.includes("wa.me")) return "whatsapp"
  if (host.includes("telegram.me") || host.includes("t.me")) return "telegram"
  return "other"
}

function pickUserFromUnknown(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  if (o.user && typeof o.user === "object") {
    return o.user as Record<string, unknown>
  }
  if (o.data && typeof o.data === "object") {
    return o.data as Record<string, unknown>
  }
  if (o.id != null || o.name != null || o.email != null || o.avatar != null) {
    return o
  }
  return null
}

function syncUserDataInSession(partial: {
  name?: string
  avatar?: string
  image?: string
}) {
  if (typeof window === "undefined") return
  try {
    const raw = window.sessionStorage.getItem("user_data")
    const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    const image =
      (partial.avatar?.trim() || partial.image?.trim() || prev.image) as
        | string
        | undefined
    window.sessionStorage.setItem(
      "user_data",
      JSON.stringify({
        ...prev,
        ...(partial.name != null && partial.name !== ""
          ? { name: partial.name }
          : {}),
        ...(image != null && image !== "" ? { image } : {}),
      })
    )
  } catch {
    /* ignore */
  }
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-border/45 bg-card p-5 text-card-foreground ${className}`}
    >
      {children}
    </div>
  )
}

/** Cores alinhadas a `lightTheme` / `:root` (primary #18B481, secondary, success, etc.) */
const BADGE_STYLES: Record<string, string> = {
  blue: "bg-primary/10 text-primary border-primary/15",
  yellow: "bg-amber-50/80 text-amber-700 border-amber-100/60",
  green: "bg-emerald-50/80 text-emerald-700 border-emerald-100/60",
  sky: "bg-secondary/10 text-secondary border-secondary/15",
  slate: "bg-muted text-muted-foreground border-border/40",
}

function Badge({
  children,
  color = "blue",
}: {
  children: React.ReactNode
  color?: keyof typeof BADGE_STYLES
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${BADGE_STYLES[color] ?? BADGE_STYLES.blue}`}
    >
      {children}
    </span>
  )
}

const CAREER_TABS = [
  "Seguidores",
  "A seguir",
  "Experiência",
  "Empresas",
  "Projetos",
  "Certificados",
] as const

interface NetworkUserRow {
  id: string
  name: string
  avatar?: string | null
}

function parseNetworkList(
  raw: unknown,
  listKey: "followers" | "following"
): { items: NetworkUserRow[]; total: number } {
  if (!raw || typeof raw !== "object") return { items: [], total: 0 }
  const o = raw as Record<string, unknown>
  const arr = o[listKey]
  const items: NetworkUserRow[] = []
  if (Array.isArray(arr)) {
    for (const x of arr) {
      if (!x || typeof x !== "object") continue
      const u = x as Record<string, unknown>
      const id = u.id != null ? String(u.id) : ""
      if (!id) continue
      items.push({
        id,
        name: typeof u.name === "string" ? u.name : "Utilizador",
        avatar: typeof u.avatar === "string" ? u.avatar : null,
      })
    }
  }
  const total = typeof o.total === "number" ? o.total : items.length
  return { items, total }
}

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const [perfilUser, setPerfilUser] = useState<PerfilUser | null>(null)
  const [perfilInfo, setPerfilInfo] = useState<PerfilInfo | null>(null)
  const [isPerfilLoading, setIsPerfilLoading] = useState(false)
  const [careerTab, setCareerTab] = useState(0)
  const [bioExpanded, setBioExpanded] = useState(false)

  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: "",
    bio: "",
    avatar: "",
    profile_type: "pessoal",
    objective: "",
    phone: "",
    birth_date: "",
    grade: "",
    nationality: "",
    city: "",
    interest: "",
    social_link: "",
    web_url: "",
    cove_image: "",
    location: "",
  })
  const [savingProfile, setSavingProfile] = useState(false)

  const [followersList, setFollowersList] = useState<NetworkUserRow[]>([])
  const [followingList, setFollowingList] = useState<NetworkUserRow[]>([])
  const [followersTotal, setFollowersTotal] = useState(0)
  const [followingTotal, setFollowingTotal] = useState(0)
  const [networkLoading, setNetworkLoading] = useState(false)

  const profileUserId = useMemo(() => {
    if (perfilUser?.id != null) return String(perfilUser.id)
    if (typeof window !== "undefined") return getStoredUserId()
    return null
  }, [perfilUser?.id])

  const openEditProfile = useCallback(() => {
    setProfileForm({
      name: perfilUser?.name ?? user?.name ?? "",
      bio: perfilInfo?.bio ?? "",
      avatar: perfilUser?.avatar ?? user?.image ?? "",
      profile_type: perfilInfo?.profile_type ?? "pessoal",
      objective: perfilInfo?.objective ?? "",
      phone: Array.isArray(perfilInfo?.phone) ? perfilInfo.phone.join(", ") : "",
      birth_date: perfilInfo?.birth_date ?? "",
      grade: perfilInfo?.grade ?? "",
      nationality: perfilInfo?.nationality ?? "",
      city: perfilInfo?.city ?? "",
      interest: perfilInfo?.interest ?? "",
      social_link: perfilInfo?.social_link ?? "",
      web_url: Array.isArray(perfilInfo?.web_url) ? perfilInfo.web_url.join(", ") : "",
      cove_image: perfilInfo?.cove_image ?? "",
      location: perfilInfo?.location ?? "",
    })
    setEditProfileOpen(true)
  }, [perfilUser, perfilInfo, user])

  const handleSaveProfile = useCallback(async () => {
    if (typeof window === "undefined") return
    const token = window.sessionStorage.getItem("auth_token")
    if (!token) {
      toast.error("Sessão inválida. Inicie sessão novamente.")
      return
    }

    setSavingProfile(true)
    try {
      const authUserPayload = {
        name: profileForm.name.trim(),
        avatar: profileForm.avatar.trim(),
        status: "active",
      }

      const authUserRes = await fetch("/api/auth/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authUserPayload),
      })

      const authUserData = (await authUserRes.json().catch(() => null)) as
        | {
            message?: string
            user?: Record<string, unknown>
            data?: Record<string, unknown>
          }
        | null

      if (!authUserRes.ok) {
        toast.error(
          typeof authUserData?.message === "string"
            ? authUserData.message
            : "Não foi possível atualizar nome e avatar."
        )
        return
      }

      const payload = {
        profile_type: profileForm.profile_type.trim() || "pessoal",
        bio: profileForm.bio.trim(),
        objective: profileForm.objective.trim() || null,
        phone: parseCommaSeparatedList(profileForm.phone),
        birth_date: profileForm.birth_date.trim() || null,
        grade: profileForm.grade.trim() || null,
        nationality: profileForm.nationality.trim() || null,
        city: profileForm.city.trim() || null,
        interest: profileForm.interest.trim() || null,
        social_link: profileForm.social_link.trim() || null,
        web_url: parseCommaSeparatedList(profileForm.web_url),
        cove_image: profileForm.cove_image.trim() || null,
        location: profileForm.location.trim(),
      }

      const res = await fetch("/api/profiles/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = (await res.json().catch(() => null)) as
        | {
            message?: string
            user?: Record<string, unknown>
            data?: Record<string, unknown>
            perfil?: Record<string, unknown>
          }
        | null

      if (!res.ok) {
        toast.error(
          typeof data?.message === "string"
            ? data.message
            : "Não foi possível guardar o perfil."
        )
        return
      }

      const authUser = pickUserFromUnknown(authUserData)
      if (authUser && typeof authUser === "object") {
        setPerfilUser((prev) => ({
          ...(prev ?? {}),
          id:
            authUser.id != null
              ? typeof authUser.id === "number" || typeof authUser.id === "string"
                ? authUser.id
                : prev?.id
              : prev?.id,
          name: typeof authUser.name === "string" ? authUser.name : prev?.name,
          email: typeof authUser.email === "string" ? authUser.email : prev?.email,
          username:
            typeof authUser.username === "string" ? authUser.username : prev?.username,
          avatar:
            typeof authUser.avatar === "string" ? authUser.avatar : prev?.avatar,
        }))

        syncUserDataInSession({
          name: typeof authUser.name === "string" ? authUser.name : undefined,
          avatar: typeof authUser.avatar === "string" ? authUser.avatar : undefined,
        })
      }

      const u = pickUserFromUnknown(data)
      if (u && typeof u === "object") {
        setPerfilUser((prev) => ({
          ...(prev ?? {}),
          id:
            u.id != null
              ? typeof u.id === "number" || typeof u.id === "string"
                ? u.id
                : prev?.id
              : prev?.id,
          name: typeof u.name === "string" ? u.name : prev?.name,
          email: typeof u.email === "string" ? u.email : prev?.email,
          username: typeof u.username === "string" ? u.username : prev?.username,
          avatar: typeof u.avatar === "string" ? u.avatar : prev?.avatar,
        }))

        const perfilNested =
          u.perfil && typeof u.perfil === "object"
            ? (u.perfil as { bio?: string; location?: string })
            : null

        const bio =
          typeof u.bio === "string"
            ? u.bio
            : perfilNested?.bio
        const location =
          typeof u.location === "string"
            ? u.location
            : perfilNested?.location

        setPerfilInfo((prev) => ({
          ...prev,
          ...(bio !== undefined ? { bio } : {}),
          ...(location !== undefined ? { location } : {}),
        }))

        syncUserDataInSession({
          name: typeof u.name === "string" ? u.name : undefined,
          avatar: typeof u.avatar === "string" ? u.avatar : undefined,
        })
      }

      const perfilFromNested = pickPerfilInfoFromUnknown(data?.perfil)
      const perfilFromRoot = pickPerfilInfoFromUnknown(data)
      const perfilFromData = pickPerfilInfoFromUnknown(data?.data)
      const perfilToApply = perfilFromNested ?? perfilFromRoot
      const perfilMerged = perfilToApply ?? perfilFromData
      if (perfilMerged) {
        setPerfilInfo((prev) => ({
          ...(prev ?? {}),
          ...perfilMerged,
        }))
      }

      toast.success("Perfil atualizado.")
      setEditProfileOpen(false)
      router.refresh()
    } catch {
      toast.error("Erro de ligação. Tente novamente.")
    } finally {
      setSavingProfile(false)
    }
  }, [profileForm, router, toast])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    const fetchPerfil = async () => {
      if (typeof window === "undefined") return
      const token = window.sessionStorage.getItem("auth_token")
      if (!token) return

      setIsPerfilLoading(true)
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }
        const [authUserRes, profileRes] = await Promise.all([
          fetch("/api/auth/user/profile", { method: "GET", headers }),
          fetch("/api/profiles/me", { method: "GET", headers }),
        ])

        const authUserData = (await authUserRes.json().catch(() => null)) as
          | {
              user?: PerfilUser
              data?: PerfilUser
            }
          | null
        const profileData = (await profileRes.json().catch(() => null)) as
          | {
              user?: PerfilUser
              data?: PerfilUser
              perfil?: PerfilInfo
            }
          | null

        if (!cancelled) {
          const resolvedUser =
            (pickUserFromUnknown(authUserData) as PerfilUser | null) ??
            (pickUserFromUnknown(profileData) as PerfilUser | null)
          if (resolvedUser) {
            setPerfilUser((prev) => ({
              ...(prev ?? {}),
              ...resolvedUser,
            }))
            syncUserDataInSession({
              name: typeof resolvedUser.name === "string" ? resolvedUser.name : undefined,
              avatar:
                typeof resolvedUser.avatar === "string" ? resolvedUser.avatar : undefined,
            })
          }
          const perfilFromNested = pickPerfilInfoFromUnknown(profileData?.perfil)
          const perfilFromRoot = pickPerfilInfoFromUnknown(profileData)
          const perfilFromData = pickPerfilInfoFromUnknown(profileData?.data)
          const perfilToApply = perfilFromNested ?? perfilFromRoot ?? perfilFromData
          if (perfilToApply) {
            setPerfilInfo((prev) => ({
              ...(prev ?? {}),
              ...perfilToApply,
            }))
          }
        }
      } finally {
        if (!cancelled) {
          setIsPerfilLoading(false)
        }
      }
    }

    fetchPerfil()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!profileUserId || !isAuthenticated) return
    let cancelled = false
    setNetworkLoading(true)

    const load = async () => {
      const token =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("auth_token")
          : null
      const headers: HeadersInit = { Accept: "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      try {
        const [r1, r2] = await Promise.all([
          fetch(
            `/api/users/${encodeURIComponent(profileUserId)}/followers`,
            { headers }
          ),
          fetch(
            `/api/users/${encodeURIComponent(profileUserId)}/following`,
            { headers }
          ),
        ])
        const [d1, d2] = await Promise.all([
          r1.json().catch(() => null),
          r2.json().catch(() => null),
        ])
        if (cancelled) return
        if (r1.ok && d1) {
          const p = parseNetworkList(d1, "followers")
          setFollowersList(p.items)
          setFollowersTotal(p.total)
        } else {
          setFollowersList([])
          setFollowersTotal(0)
        }
        if (r2.ok && d2) {
          const p = parseNetworkList(d2, "following")
          setFollowingList(p.items)
          setFollowingTotal(p.total)
        } else {
          setFollowingList([])
          setFollowingTotal(0)
        }
      } finally {
        if (!cancelled) setNetworkLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [profileUserId, isAuthenticated])

  const handleShare = async () => {
    if (typeof window === "undefined") return
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* ignore */
    }
  }

  if (isLoading || isPerfilLoading) {
    return <ProfileLayoutSkeleton />
  }

  if (!isAuthenticated) {
    return null
  }

  const displayUser = {
    name: perfilUser?.name ?? user?.name,
    email: perfilUser?.email ?? user?.email,
    image: user?.image ?? undefined,
    avatar: perfilUser?.avatar,
    username: perfilUser?.username,
  }

  const avatarSrc = resolveUserAvatarUrl(displayUser.avatar ?? displayUser.image)
  const rawBio = perfilInfo?.bio?.trim() ?? ""
  const bioPreviewLen = 160
  const showBioToggle = rawBio.length > bioPreviewLen
  const bioText =
    !rawBio
      ? "Ainda não adicionou uma biografia. Conte quem é e o que faz — ajuda clientes a confiar em si."
      : bioExpanded || !showBioToggle
        ? rawBio
        : `${rawBio.slice(0, bioPreviewLen).trim()}…`

  const locationLabel = perfilInfo?.location?.trim()
    ? perfilInfo.location
    : "Localização não definida"
  const profileTypeLabel = perfilInfo?.profile_type?.trim() || "Não definido"
  const objectiveLabel = perfilInfo?.objective?.trim() || "Não definido"
  const phoneLabel =
    Array.isArray(perfilInfo?.phone) && perfilInfo.phone.length > 0
      ? perfilInfo.phone.join(", ")
      : "Não definido"
  const gradeLabel = perfilInfo?.grade?.trim() || "Não definido"
  const nationalityLabel = perfilInfo?.nationality?.trim() || "Não definido"
  const cityLabel = perfilInfo?.city?.trim() || "Não definido"
  const interestLabel = perfilInfo?.interest?.trim() || "Não definido"
  const socialLinkRaw = perfilInfo?.social_link?.trim() || ""
  const socialLinkHref = normalizeExternalUrl(socialLinkRaw)
  const socialLinkCompact = socialLinkRaw ? compactLinkLabel(socialLinkRaw) : ""
  const socialNetworkKey = socialLinkRaw
    ? detectSocialNetworkKey(socialLinkRaw)
    : "other"
  const webUrlLabel =
    Array.isArray(perfilInfo?.web_url) && perfilInfo.web_url.length > 0
      ? perfilInfo.web_url.join(", ")
      : "Não definido"

  const usernameShort =
    displayUser.username && displayUser.username.length > 24
      ? `${displayUser.username.slice(0, 21)}…`
      : displayUser.username ?? "—"

  return (
    <div className="">
      <div className="mx-auto grid  grid-cols-1 gap-6 p-4  lg:grid-cols-12">
          {/* Sidebar esquerda */}
          <aside className="space-y-6 lg:col-span-3">
           

            <Card>
              <h3 className="mb-4 text-sm font-bold">Actividades</h3>
              <div className="flex flex-col items-center py-6 text-muted-foreground">
                <FileText
                  size={40}
                  strokeWidth={1}
                  className="mb-2 opacity-20"
                />
                <p className="text-xs">Nenhuma publicação ainda</p>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold">Ferramentas</h3>
                <Link href="/configuracoes" aria-label="Editar ferramentas">
                  <Pencil size={14} className="text-muted-foreground hover:text-foreground" />
                </Link>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge color="blue">Github</Badge>
                  <Badge color="yellow">Javascript</Badge>
                  <Badge color="green">Node.Js</Badge>
                  <Badge color="sky">React Native</Badge>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-lg border border-primary/12 py-2 text-xs font-medium text-primary hover:bg-primary/5"
                >
                  Ver mais <ChevronDown size={14} className="inline" />
                </button>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold">Idiomas</h3>
              </div>
              <div className="space-y-2">
                <Badge color="slate">Português</Badge>
              </div>
            </Card>
          </aside>

          {/* Conteúdo central */}
          <div className="space-y-6 lg:col-span-9">
            <div className="overflow-hidden rounded-md border border-border/45 bg-card">
              <div className="relative h-48 bg-primary/15">
                <div className="absolute inset-0 flex items-center justify-center opacity-25">
                  <MapPin size={48} className="text-primary" />
                </div>
              </div>
              <div className="relative px-4 pb-8 pt-0 md:px-8">
                <div className="-translate-y-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="relative shrink-0">
                    <div className="relative h-32 w-32 overflow-hidden rounded-3xl border-2 border-border/35 bg-card">
                      <Image
                        src={avatarSrc}
                        alt={displayUser.name ?? "Avatar"}
                        fill
                        sizes="128px"
                        className="object-cover"
                        priority
                        unoptimized={userAvatarSrcUnoptimized(avatarSrc)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 sm:mb-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex items-center gap-2 rounded-lg border border-border/45 px-4 py-2 text-sm font-semibold transition-all hover:bg-accent md:px-6"
                    >
                      <Share2 size={16} /> Partilhar
                    </button>
                    <button
                      type="button"
                      onClick={openEditProfile}
                      className="flex items-center justify-center rounded-lg border border-border/45 p-2 transition-colors hover:bg-accent"
                      aria-label="Editar perfil"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>

                <div className="-mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
                  <div className="md:col-span-8">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold">
                        {displayUser.name || "Utilizador"}
                      </h1>
                      <span className="rounded border border-primary/15 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Conta ativa
                      </span>
                    </div>
                    {displayUser.username ? (
                      <p className="mb-2 text-sm text-muted-foreground">
                        @{usernameShort}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} /> Profissional
                      </span>
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">{locationLabel}</span>
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <span className="text-base leading-none" aria-hidden>
                          🇦🇴
                        </span>
                        Angola
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <BarChart2 size={14} /> Estatísticas
                      </span>
                    </div>
                  </div>

                  
                </div>
              </div>
            </div>

            <Card className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div>
                <h3 className="mb-6 font-bold">Avaliações</h3>
                <div className="flex flex-col items-start gap-8 sm:flex-row">
                  <div className="text-center">
                    <p className="mb-1 text-5xl font-black">0.0</p>
                    <div className="flex gap-0.5 text-border/55">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s}>★</span>
                      ))}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">0 avaliações</p>
                  </div>
                  <div className="w-full flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((num) => (
                      <div
                        key={num}
                        className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground"
                      >
                        <span>{num}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full w-0 bg-primary" />
                        </div>
                        <span>0</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted opacity-50">
                  <MessageSquare size={32} className="text-muted-foreground" />
                </div>
                <p className="font-bold text-muted-foreground">Sem avaliações</p>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">Biografia</h3>
                <button
                  type="button"
                  onClick={openEditProfile}
                  aria-label="Editar biografia"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Pencil size={16} />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {bioText}
                {showBioToggle ? (
                  <button
                    type="button"
                    onClick={() => setBioExpanded((e) => !e)}
                    className="ml-1 font-semibold text-primary hover:underline"
                  >
                    {bioExpanded ? "Mostrar menos" : "Ler mais"}
                  </button>
                ) : null}
              </p>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold">Informações do perfil</h3>
                <button
                  type="button"
                  onClick={openEditProfile}
                  aria-label="Editar informações do perfil"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Pencil size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <MapPin size={14} className="text-primary" />
                    Localização
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{locationLabel}</p>
                </div>
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <UserRound size={14} className="text-primary" />
                    Tipo de perfil
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{profileTypeLabel}</p>
                </div>
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Goal size={14} className="text-primary" />
                    Objetivo
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{objectiveLabel}</p>
                </div>
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Phone size={14} className="text-primary" />
                    Telefone
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{phoneLabel}</p>
                </div>
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <GraduationCap size={14} className="text-primary" />
                    Grau
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{gradeLabel}</p>
                </div>
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Flag size={14} className="text-primary" />
                    Nacionalidade
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{nationalityLabel}</p>
                </div>
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Building2 size={14} className="text-primary" />
                    Cidade
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{cityLabel}</p>
                </div>
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Sparkles size={14} className="text-primary" />
                    Interesse
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{interestLabel}</p>
                </div>
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <LinkIcon size={14} className="text-primary" />
                    Link social
                  </p>
                  {socialLinkHref ? (
                    <a
                      href={socialLinkHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                      aria-label="Abrir link social"
                    >
                      {socialNetworkKey === "instagram" ? (
                        <Instagram size={12} />
                      ) : socialNetworkKey === "facebook" ? (
                        <Facebook size={12} />
                      ) : socialNetworkKey === "linkedin" ? (
                        <Linkedin size={12} />
                      ) : socialNetworkKey === "tiktok" ? (
                        <Music2 size={12} />
                      ) : socialNetworkKey === "x" ? (
                        <MessageCircle size={12} />
                      ) : socialNetworkKey === "youtube" ? (
                        <Youtube size={12} />
                      ) : socialNetworkKey === "whatsapp" ? (
                        <MessageCircle size={12} />
                      ) : socialNetworkKey === "telegram" ? (
                        <Send size={12} />
                      ) : (
                        <LinkIcon size={12} />
                      )}
                      {socialLinkCompact}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-foreground break-all">
                      Não definido
                    </p>
                  )}
                </div>
                <div className="rounded-lg border border-border/45 bg-muted/20 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Globe size={14} className="text-primary" />
                    Web URL
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground break-all">{webUrlLabel}</p>
                </div>
              </div>
            </Card>

            <Card className="min-h-[400px]">
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="font-bold">Minha Carreira</h3>
                {careerTab >= 2 ? (
                  <div className="flex flex-wrap gap-2">
                    <select
                      className="rounded-lg border border-border/45 bg-background px-3 py-2 text-xs text-foreground outline-none"
                      aria-label="Filtrar carreira"
                    >
                      <option>Todos</option>
                    </select>
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Adicionar
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mb-8 flex gap-4 overflow-x-auto border-b border-border/40 pb-1">
                {CAREER_TABS.map((tab, i) => {
                  const count =
                    i === 0
                      ? followersTotal
                      : i === 1
                        ? followingTotal
                        : 0
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCareerTab(i)}
                      className={`whitespace-nowrap px-2 pb-2 text-xs font-bold ${
                        careerTab === i
                          ? "border-b-2 border-primary text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}{" "}
                      <span className="ml-1 rounded bg-muted px-1.5 text-[10px]">
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {!profileUserId ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Inicie sessão com uma conta que tenha ID de utilizador para ver
                  seguidores e lista a seguir.
                </p>
              ) : networkLoading ? (
                <NetworkListSkeleton rows={8} />
              ) : careerTab === 0 ? (
                <ul className="divide-y divide-border/40">
                  {followersList.length === 0 ? (
                    <li className="py-10 text-center text-sm text-muted-foreground">
                      Ainda não tem seguidores.
                    </li>
                  ) : (
                    followersList.map((u) => {
                      const src = resolveUserAvatarUrl(u.avatar ?? undefined)
                      return (
                        <li key={u.id}>
                          <Link
                            href={`/detalhesuser?userId=${encodeURIComponent(u.id)}`}
                            className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/50"
                          >
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/35 bg-muted">
                              <Image
                                src={src}
                                alt={u.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized={userAvatarSrcUnoptimized(src)}
                              />
                            </div>
                            <span className="font-medium text-foreground">
                              {u.name}
                            </span>
                          </Link>
                        </li>
                      )
                    })
                  )}
                </ul>
              ) : careerTab === 1 ? (
                <ul className="divide-y divide-border/40">
                  {followingList.length === 0 ? (
                    <li className="py-10 text-center text-sm text-muted-foreground">
                      Ainda não segue ninguém.
                    </li>
                  ) : (
                    followingList.map((u) => {
                      const src = resolveUserAvatarUrl(u.avatar ?? undefined)
                      return (
                        <li key={u.id}>
                          <Link
                            href={`/detalhesuser?userId=${encodeURIComponent(u.id)}`}
                            className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/50"
                          >
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/35 bg-muted">
                              <Image
                                src={src}
                                alt={u.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized={userAvatarSrcUnoptimized(src)}
                              />
                            </div>
                            <span className="font-medium text-foreground">
                              {u.name}
                            </span>
                          </Link>
                        </li>
                      )
                    })
                  )}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 rounded-2xl bg-muted p-4">
                    <Briefcase size={32} className="text-muted-foreground/50" />
                  </div>
                  <h4 className="font-bold text-foreground">
                    Nenhum evento encontrado
                  </h4>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Tente ajustar os filtros ou criar um novo evento na sua
                    timeline.
                  </p>
                </div>
              )}
            </Card>
          </div>
      </div>

      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="border-border/45 shadow-none sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>
              Atualize os dados do perfil pessoal e os contactos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Nome</Label>
              <Input
                id="profile-name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, name: e.target.value }))
                }
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-bio">Biografia</Label>
              <Textarea
                id="profile-bio"
                value={profileForm.bio}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, bio: e.target.value }))
                }
                rows={4}
                placeholder="Fale sobre o seu trabalho e experiência…"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-location">Localização</Label>
              <Input
                id="profile-location"
                value={profileForm.location}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, location: e.target.value }))
                }
                autoComplete="address-level2"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-type">Tipo de perfil</Label>
              <Input
                id="profile-type"
                value={profileForm.profile_type}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, profile_type: e.target.value }))
                }
                placeholder="pessoal"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-objective">Objetivo</Label>
              <Input
                id="profile-objective"
                value={profileForm.objective}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, objective: e.target.value }))
                }
                placeholder="Descreva o objetivo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-phone">Telefones (separados por vírgula)</Label>
              <Input
                id="profile-phone"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="9999999, 999999"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-birth-date">Data de nascimento</Label>
              <Input
                id="profile-birth-date"
                type="date"
                value={profileForm.birth_date}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, birth_date: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-grade">Grau</Label>
              <Input
                id="profile-grade"
                value={profileForm.grade}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, grade: e.target.value }))
                }
                placeholder="Ex.: Sénior"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-nationality">Nacionalidade</Label>
              <Input
                id="profile-nationality"
                value={profileForm.nationality}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, nationality: e.target.value }))
                }
                placeholder="Angola"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-city">Cidade</Label>
              <Input
                id="profile-city"
                value={profileForm.city}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, city: e.target.value }))
                }
                placeholder="Luanda"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-interest">Interesse</Label>
              <Input
                id="profile-interest"
                value={profileForm.interest}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, interest: e.target.value }))
                }
                placeholder="Área de interesse"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-social-link">Link social</Label>
              <Input
                id="profile-social-link"
                value={profileForm.social_link}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, social_link: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-web-url">Web URLs (separados por vírgula)</Label>
              <Input
                id="profile-web-url"
                value={profileForm.web_url}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, web_url: e.target.value }))
                }
                placeholder="site1.com, site2.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-cover-image">Imagem de capa (URL)</Label>
              <Input
                id="profile-cover-image"
                type="url"
                value={profileForm.cove_image}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, cove_image: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-avatar">URL do avatar</Label>
              <Input
                id="profile-avatar"
                type="url"
                value={profileForm.avatar}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, avatar: e.target.value }))
                }
                placeholder="https://…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditProfileOpen(false)}
              disabled={savingProfile}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "A guardar…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
