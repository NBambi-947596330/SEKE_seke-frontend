"use client"

import { useAuth } from "@/lib/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <p className="text-gray-600">A carregar…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-bold text-gray-900">Meu perfil</h1>
      <p className="mt-2 text-gray-600">
        Esta é a sua área pessoal. Aqui pode ver e editar os seus dados.
      </p>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Nome</dt>
            <dd className="mt-1 text-gray-900">{user?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">E-mail</dt>
            <dd className="mt-1 text-gray-900">{user?.email ?? "—"}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <Link
            href="/configuracoes"
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            Ir para Configuração →
          </Link>
        </div>
      </div>
    </div>
  )
}
