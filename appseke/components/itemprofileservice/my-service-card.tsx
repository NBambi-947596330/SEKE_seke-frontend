import { Briefcase, Clock, MapPin, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { MarketplaceService } from "@/types/marketplace"

function formatPrice(service: MarketplaceService): string {
  const value = Number(service.price)
  const formatted = Number.isFinite(value)
    ? value.toLocaleString("pt-AO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : String(service.price)
  const suffix = service.price_unit === "hourly" ? "/hora" : ""
  return `${formatted} Kz${suffix}`
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`
}

interface MyServiceCardProps {
  service: MarketplaceService
}

export function MyServiceCard({ service }: MyServiceCardProps) {
  const rating = Number(service.rating_avg)
  const hasRating = Number.isFinite(rating) && rating > 0

  return (
    <Card className="gap-0 overflow-hidden border-border/45 py-0 shadow-none transition-colors hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase size={20} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold text-foreground">
                  {service.title}
                </h4>
                {service.category_name ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {service.category_name}
                  </p>
                ) : null}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  service.is_active
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {service.is_active ? "Ativo" : "Inativo"}
              </span>
            </div>

            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {service.description}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatPrice(service)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} aria-hidden />
                {formatDuration(service.duration_minutes)}
              </span>
              {service.is_on_site ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} aria-hidden />
                  até {service.max_distance_km} km
                </span>
              ) : null}
              {hasRating ? (
                <span className="inline-flex items-center gap-1">
                  <Star size={12} className="text-amber-500" aria-hidden />
                  {rating.toFixed(1)}
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              {service.is_remote ? (
                <span className="rounded-md bg-muted px-2 py-0.5">Remoto</span>
              ) : null}
              {service.is_on_site ? (
                <span className="rounded-md bg-muted px-2 py-0.5">No local</span>
              ) : null}
              <span>{service.views_count} vistas</span>
              <span>{service.bookings_count} reservas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
