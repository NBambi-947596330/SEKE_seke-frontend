 "use client"

import { useAuth } from "@/lib/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Calendar, Settings, User, Mail, ArrowUpRight, PencilLine } from "lucide-react"
import SidebarProfissional from "@/components/itemsidebar/itemsidebar"

interface PerfilUser {
  id?: number
  name?: string
  email?: string
  username?: string
  avatar?: string
  image?: string
}

interface PerfilInfo {
  bio?: string
  location?: string
  member_since?: string
}

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [perfilUser, setPerfilUser] = useState<PerfilUser | null>(null)
  const [perfilInfo, setPerfilInfo] = useState<PerfilInfo | null>(null)
  const [isPerfilLoading, setIsPerfilLoading] = useState(false)

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
        const res = await fetch("/api/auth/perfil", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) return

        const data = (await res.json().catch(() => null)) as
          | {
              user?: PerfilUser
              perfil?: PerfilInfo
            }
          | null

        if (!cancelled) {
          if (data?.user) {
            setPerfilUser(data.user)
          }
          if (data?.perfil) {
            setPerfilInfo(data.perfil)
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

  if (isLoading || isPerfilLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <p className="text-gray-500">A carregar…</p>
      </div>
    )
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

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  const avatarUrl = displayUser.avatar ?? displayUser.image
  const memberSinceLabel = perfilInfo?.member_since
    ? new Date(perfilInfo.member_since).toLocaleDateString("pt-PT", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    : "—"

  return (
    <SidebarProfissional>
      <div className="container mx-auto px-4 py-8 pt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Perfil</h1>
              <p className="mt-1 text-sm text-gray-500">
                Informações da sua conta e do seu perfil público.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/configuracoes"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Configurações
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Hero card */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative">
              <div className="h-24 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />
              <div className="absolute left-6 top-12 flex items-end gap-4">
                <div className="rounded-full bg-white p-1 shadow-sm">
                  {avatarUrl ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-white">
                      <Image
                        src={avatarUrl}
                        alt={displayUser.name ?? displayUser.email ?? "Avatar"}
                        fill
                        sizes="80px"
                        className="object-cover"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-700 ring-2 ring-white">
                      {getInitials(displayUser.name, displayUser.email)}
                    </div>
                  )}
                </div>

                <div className="pb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {displayUser.name || "Utilizador"}
                    </h2>
                    {displayUser.username ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        @{displayUser.username}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600">{displayUser.email ?? "—"}</p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-16">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Membro desde {memberSinceLabel}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {perfilInfo?.location?.trim() ? perfilInfo.location : "Localização não definida"}
                  </span>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PencilLine className="h-4 w-4" />
                  Editar perfil
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Conta</h3>
              <p className="mt-1 text-sm text-gray-500">Dados de identificação e contacto.</p>

              <dl className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-medium text-gray-500">E-mail</dt>
                    <dd className="mt-0.5 text-sm font-medium text-gray-900">{displayUser.email ?? "—"}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Perfil</h3>
              <p className="mt-1 text-sm text-gray-500">Informações públicas do seu perfil.</p>

              <dl className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Bio</dt>
                    <dd className="mt-0.5 text-sm text-gray-900">
                      {perfilInfo?.bio?.trim() ? perfilInfo.bio : "Sem biografia."}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </SidebarProfissional>
  )
}