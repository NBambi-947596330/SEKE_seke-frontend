"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Send } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProvinceSelect } from "@/components/province-select/province-select"
import { useToast } from "@/components/ui/toaster"
import { useAuth } from "@/lib/use-auth"
import { fetchMarketplaceCategories } from "@/lib/marketplace-client"
import { createServiceRequest } from "@/lib/service-request-client"
import { resolveUserAvatarUrl, userAvatarSrcUnoptimized } from "@/lib/user-avatar"
import { cn } from "@/lib/utils"
import type { MarketplaceCategory } from "@/types/marketplace"
import type { MarketplaceServiceRequest } from "@/types/service-request"

function getSessionToken(): string | null {
  if (typeof window === "undefined") return null
  return window.sessionStorage.getItem("auth_token")
}

function getDefaultPreferredDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

function toLocalDatetimeInputValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export interface ItemSolicitacaoCriarProps {
  onSuccess?: (request: MarketplaceServiceRequest) => void
  className?: string
}

export function ItemSolicitacaoCriar({ onSuccess, className }: ItemSolicitacaoCriarProps) {
  const toast = useToast()
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<MarketplaceCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  const [categoryId, setCategoryId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [locationText, setLocationText] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)

  const resetForm = useCallback(() => {
    setCategoryId("")
    setTitle("")
    setDescription("")
    setBudgetMin("")
    setBudgetMax("")
    setPreferredDate("")
    setLocationText("")
    setIsUrgent(false)
  }, [])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setCategoriesLoading(true)
    const token = getSessionToken()

    void fetchMarketplaceCategories(token ?? undefined).then((result) => {
      if (cancelled) return
      if (result.success) {
        setCategories(result.data)
      } else {
        toast.error(result.error)
      }
      setCategoriesLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [open, toast])

  useEffect(() => {
    if (open && !preferredDate) {
      setPreferredDate(getDefaultPreferredDate())
    }
  }, [open, preferredDate])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const token = getSessionToken()
      if (!token) {
        toast.error("Inicie sessão para solicitar um serviço.")
        return
      }

      if (!categoryId.trim()) {
        toast.error("Selecione uma categoria.")
        return
      }

      const trimmedTitle = title.trim()
      if (!trimmedTitle) {
        toast.error("Informe um título para a solicitação.")
        return
      }

      const trimmedDescription = description.trim()
      if (!trimmedDescription) {
        toast.error("Descreva o que precisa.")
        return
      }

      const min = Number(budgetMin)
      const max = Number(budgetMax)
      if (!Number.isFinite(min) || min < 0) {
        toast.error("Informe um orçamento mínimo válido.")
        return
      }
      if (!Number.isFinite(max) || max < 0) {
        toast.error("Informe um orçamento máximo válido.")
        return
      }
      if (max < min) {
        toast.error("O orçamento máximo deve ser maior ou igual ao mínimo.")
        return
      }

      if (!locationText.trim()) {
        toast.error("Selecione ou informe a localização.")
        return
      }

      const isoDate = preferredDate.trim()
        ? new Date(preferredDate).toISOString()
        : getDefaultPreferredDate()

      setIsLoading(true)
      try {
        const result = await createServiceRequest(
          {
            category_id: categoryId.trim(),
            title: trimmedTitle,
            description: trimmedDescription,
            budget_min: min,
            budget_max: max,
            preferred_date: isoDate,
            is_urgent: isUrgent,
            location_text: locationText.trim(),
          },
          token
        )

        if (!result.success) {
          toast.error(result.error)
          return
        }

        toast.success("Solicitação publicada com sucesso.")
        resetForm()
        setOpen(false)
        onSuccess?.(result.data)
      } catch {
        toast.error("Erro de ligação. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    },
    [
      categoryId,
      title,
      description,
      budgetMin,
      budgetMax,
      preferredDate,
      locationText,
      isUrgent,
      onSuccess,
      resetForm,
      toast,
    ]
  )

  if (!isAuthenticated) {
    return null
  }

  const avatarSrc = resolveUserAvatarUrl(user?.image)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground",
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="size-11 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
            <Image
              src={avatarSrc}
              alt=""
              width={44}
              height={44}
              className="size-full object-cover"
              unoptimized={userAvatarSrcUnoptimized(avatarSrc)}
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-11 w-full cursor-pointer rounded-full border border-border/70 bg-muted/30 px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50"
          >
            Precisa de um profissional? Descreva o serviço…
          </button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Solicitar um serviço</DialogTitle>
              <DialogDescription>
                Descreva o que precisa. Profissionais da categoria verão o seu pedido na home.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sr-category">Categoria</Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={isLoading || categoriesLoading}
                >
                  <SelectTrigger id="sr-category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sr-title">Título</Label>
                <Input
                  id="sr-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Preciso de um encanador"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sr-description">Descrição</Label>
                <Textarea
                  id="sr-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o problema ou serviço necessário"
                  rows={3}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="sr-budget-min">Orçamento mín. (Kz)</Label>
                  <Input
                    id="sr-budget-min"
                    type="number"
                    min={0}
                    step={100}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sr-budget-max">Orçamento máx. (Kz)</Label>
                  <Input
                    id="sr-budget-max"
                    type="number"
                    min={0}
                    step={100}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sr-date">Data preferida</Label>
                <Input
                  id="sr-date"
                  type="datetime-local"
                  value={preferredDate ? toLocalDatetimeInputValue(preferredDate) : ""}
                  onChange={(e) => {
                    const value = e.target.value
                    if (!value) {
                      setPreferredDate("")
                      return
                    }
                    setPreferredDate(new Date(value).toISOString())
                  }}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sr-location">Localização</Label>
                <ProvinceSelect
                  id="sr-location"
                  value={locationText}
                  onChange={setLocationText}
                  disabled={isLoading}
                  placeholder="Selecione a província"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border"
                />
                <span className="text-sm">Urgente</span>
              </label>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading || categoriesLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Publicando…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Publicar solicitação
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
