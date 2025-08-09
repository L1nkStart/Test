import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight, BarChart3, CalendarClock, Building2, Filter, List, Shield, TrendingUp, Users } from "lucide-react"
import { getInsuranceHoldersSummary } from "@/lib/holders"

export const metadata: Metadata = {
  title: "Panel",
  description: "Resumen operativo y accesos rápidos",
}

export default async function DashboardPage() {
  const summary = await getInsuranceHoldersSummary()
  const holders = summary.totals.holders
  const active = summary.totals.activePolicies
  const totalMax = summary.coverage.totalMax
  const totalUsed = summary.coverage.totalUsed
  const usedPct = totalMax > 0 ? Math.min(100, Math.round((totalUsed / totalMax) * 100)) : 0

  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Panel</h1>
          <p className="text-sm text-muted-foreground">Resumen del sistema y accesos rápidos a titulares de seguro.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/insurance-holders">
              <List className="h-4 w-4 mr-2" />
              Ver titulares
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/insurance-holders?status=Activo">
              <Filter className="h-4 w-4 mr-2" />
              Activos
            </Link>
          </Button>
        </div>
      </header>

      {/* KPIs + últimos 7 días */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Kpi title="Total Titulares" icon={<Shield className="h-4 w-4" />} value={holders} />
        <Kpi title="Pólizas Activas" icon={<TrendingUp className="h-4 w-4" />} value={active} />
        <Kpi
          title="Cobertura Usada"
          icon={<Users className="h-4 w-4" />}
          valueLabel={`${formatCurrency(totalUsed)} / ${formatCurrency(totalMax)}`}
          progress={usedPct}
        />
        <Kpi title="Creados (7d)" icon={<CalendarClock className="h-4 w-4" />} value={summary.totals.created7d} />
        <Kpi title="Actualizados (7d)" icon={<CalendarClock className="h-4 w-4" />} value={summary.totals.updated7d} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Gráfica por estado */}
        <Card className="xl:col-span-1">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[hsl(var(--accent))]" />
              Distribución por estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.statusDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos de estado.</p>
            ) : (
              <StatusBarChart data={summary.statusDistribution} />
            )}
          </CardContent>
        </Card>

        {/* Top compañías */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Top Compañías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos de compañías.</p>
            ) : (
              summary.topCompanies.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[hsl(var(--accent))]" />
                    <span className="text-sm">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{c.count}</Badge>
                    <Button asChild size="sm" variant="ghost" className="h-7 px-2">
                      <Link href={`/insurance-holders?company=${encodeURIComponent(c.name)}`}>
                        Ver
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Alertas de vencimiento */}
        <Card className="xl:col-span-1 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Pólizas por vencer (≤ 30 días)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30 table-header-floating">
                  <TableRow>
                    <TableHead>Titular</TableHead>
                    <TableHead>Compañía</TableHead>
                    <TableHead className="text-right">Vence en</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.expiringSoon.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No hay pólizas por vencer pronto.
                      </TableCell>
                    </TableRow>
                  ) : (
                    summary.expiringSoon.map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/40">
                        <TableCell className="font-medium">
                          {r.name}
                          <div className="text-xs text-muted-foreground">{r.policyNumber || "—"}</div>
                        </TableCell>
                        <TableCell className="text-sm">{r.insuranceCompany || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={badgeByDays(r.daysLeft)}>
                            {r.daysLeft != null ? `${r.daysLeft} días` : "—"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recientes */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Titulares recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 table-header-floating">
                <TableRow>
                  <TableHead className="min-w-[220px]">Titular</TableHead>
                  <TableHead className="min-w-[180px]">Contacto</TableHead>
                  <TableHead className="min-w-[140px]">Póliza</TableHead>
                  <TableHead className="min-w-[160px]">Compañía</TableHead>
                  <TableHead className="min-w-[120px]">Estado</TableHead>
                  <TableHead className="min-w-[200px]">Cobertura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Sin registros recientes.
                    </TableCell>
                  </TableRow>
                ) : (
                  summary.recent.map((h) => {
                    const used = Number(h.usedCoverageAmount || 0)
                    const max = Number(h.maxCoverageAmount || 0)
                    const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
                    return (
                      <TableRow key={h.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{h.name}</span>
                            <span className="text-xs text-muted-foreground">{h.ci}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{h.phone}</span>
                            {h.email ? <span className="text-xs text-muted-foreground">{h.email}</span> : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{h.policyNumber || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{h.insuranceCompany || "N/A"}</TableCell>
                        <TableCell>
                          <StatusBadge status={h.policyStatus} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{h.coverageType || "Cobertura"}</span>
                              <span className="font-medium">
                                {formatCurrency(used)} / {formatCurrency(max)}
                              </span>
                            </div>
                            <Progress value={pct} className="h-2.5 rounded-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function Kpi({
  title,
  icon,
  value,
  valueLabel,
  progress,
}: {
  title: string
  icon: React.ReactNode
  value?: number
  valueLabel?: string
  progress?: number
}) {
  return (
    <Card className="kpi-card">
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="kpi-icon">{icon}</div>
      </CardHeader>
      <CardContent className="space-y-2">
        {typeof value === "number" ? <div className="text-2xl font-semibold">{value}</div> : null}
        {valueLabel ? <div className="text-sm text-muted-foreground">{valueLabel}</div> : null}
        {typeof progress === "number" ? <Progress value={progress} className="h-2.5 rounded-full" /> : null}
      </CardContent>
    </Card>
  )
}

function StatusBarChart({ data }: { data: Array<{ status: string; count: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.count || 0))
  const colors: Record<string, string> = {
    Activo: "bg-[hsl(var(--success))]",
    Suspendido: "bg-[hsl(var(--warning))]",
    Vencido: "bg-orange-500",
    Cancelado: "bg-[hsl(var(--danger))]",
  }
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.status} className="flex items-center gap-3">
          <div className="w-28 text-xs text-muted-foreground">{d.status || "—"}</div>
          <div className="flex-1 h-3 rounded bg-muted">
            <div
              className={`h-3 rounded ${colors[d.status] || "bg-gray-400"}`}
              style={{ width: `${Math.round((d.count / max) * 100)}%` }}
              aria-label={`${d.status}: ${d.count}`}
              role="img"
            />
          </div>
          <div className="w-8 text-right text-sm tabular-nums">{d.count}</div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || "").toLowerCase()
  const cls =
    s === "activo"
      ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/20"
      : s === "suspendido"
        ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/25"
        : s === "vencido"
          ? "bg-orange-100 text-orange-800 border-orange-200"
          : s === "cancelado"
            ? "bg-[hsl(var(--danger))]/15 text-[hsl(var(--danger))] border-[hsl(var(--danger))]/25"
            : "bg-gray-100 text-gray-800 border-gray-200"
  return (
    <Badge variant="outline" className={cls + " capitalize"}>
      {status || "N/A"}
    </Badge>
  )
}

function badgeByDays(daysLeft: number | null) {
  if (daysLeft == null) return "secondary"
  if (daysLeft <= 7) return "destructive" /* rojo */
  if (daysLeft <= 14) return "default" /* gris */
  return "secondary"
}

function formatCurrency(amount?: number | null) {
  if (amount == null) return "N/A"
  try {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(Number(amount))
  } catch {
    return `$${Number(amount).toFixed(2)}`
  }
}
