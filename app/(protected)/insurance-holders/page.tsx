import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, FileText } from "lucide-react"
import { HoldersToolbar } from "@/components/holders/holders-toolbar"
import { ActionsCell } from "@/components/holders/actions-cell"
import { getFullUserSession } from "@/lib/auth"
import { getInsuranceHoldersPage, getDistinctCompanies } from "@/lib/holders"
import { EnterpriseTokens } from "@/components/enterprise-tokens"
import { HoldersTable } from "@/components/holders/holders-table"

export const metadata: Metadata = {
  title: "Titulares de Seguro",
}

type SearchParams = {
  page?: string
  perPage?: string
  q?: string
  status?: string
  company?: string
  sort?: string
}

export default async function InsuranceHoldersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const session = await safeGetSession()
  const canManageHolders = session?.role === "Superusuario" || session?.role === "Coordinador Regional"

  const page = toNum(sp.page, 1)
  const perPage = clamp(toNum(sp.perPage, 10), 5, 50)
  const q = sp.q || ""
  const status = sp.status || ""
  const company = sp.company || ""
  const sort = sp.sort || "name.asc"

  const [data, companies] = await Promise.all([
    getInsuranceHoldersPage({ page, perPage, q, status, company, sort }),
    getDistinctCompanies(),
  ])
  const { items, total, totalPages, stats } = data

  return (
    <main className="flex flex-1 flex-col gap-6 text-[13px]">
      <EnterpriseTokens />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Titulares de Seguro</h1>
          <p className="text-sm text-muted-foreground">
            CRM de pólizas: búsqueda, filtros, acciones rápidas y métricas clave.
          </p>
        </div>
        {canManageHolders && <ActionsCell.CreateButton />}
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Kpi title="Total Titulares" icon={<Shield className="h-4 w-4 text-muted-foreground" />} value={total} />
        <Kpi
          title="Pólizas Activas"
          icon={<Shield className="h-4 w-4 text-emerald-600" />}
          value={stats?.activePolicies ?? 0}
        />
        <Kpi
          title="Total Pacientes"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          value={stats?.totalPatients ?? 0}
        />
        <Kpi
          title="Total Casos"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          value={stats?.totalCases ?? 0}
        />
      </section>

      <HoldersToolbar q={q} status={status} company={company} perPage={perPage} sort={sort} companies={companies} />

      <Card className="overflow-hidden shadow-sm ent-card">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Listado de Titulares</CardTitle>
            <p className="text-xs text-muted-foreground">
              Página {page} de {totalPages} • {total} resultados
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <HoldersTable items={items as any[]} canManage={!!canManageHolders} />
        </CardContent>
      </Card>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        perPage={perPage}
        q={q}
        status={status}
        company={company}
        sort={sort}
        total={total}
      />
    </main>
  )
}

function Kpi({ title, icon, value }: { title: string; icon: React.ReactNode; value: number }) {
  return (
    <Card className="shadow-sm ent-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

function PaginationBar({
  page,
  totalPages,
  perPage,
  q,
  status,
  company,
  sort,
  total,
}: {
  page: number
  totalPages: number
  perPage: number
  q: string
  status: string
  company: string
  sort: string
  total: number
}) {
  const prev = Math.max(1, page - 1)
  const next = Math.min(totalPages, page + 1)
  const base = "/insurance-holders"
  const qs = (p: number) =>
    `${base}?page=${p}&perPage=${perPage}&q=${encodeURIComponent(q)}&status=${encodeURIComponent(
      status,
    )}&company=${encodeURIComponent(company)}&sort=${encodeURIComponent(sort)}`
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages} • {total} resultados
      </p>
      <div className="flex items-center gap-2">
        <LinkButton href={qs(prev)} disabled={page <= 1}>
          Anterior
        </LinkButton>
        <LinkButton href={qs(next)} disabled={page >= totalPages}>
          Siguiente
        </LinkButton>
      </div>
    </div>
  )
}

function LinkButton({ href, disabled, children }: { href: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={disabled ? "#" : href}
      aria-disabled={disabled}
      className={
        "inline-flex items-center justify-center whitespace-nowrap rounded-md border bg-background px-3 py-1.5 text-sm " +
        "ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
        "disabled:pointer-events-none disabled:opacity-50" +
        (disabled ? " opacity-50 pointer-events-none" : "")
      }
    >
      {children}
    </Link>
  )
}

function toNum(v: string | undefined, fallback: number) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
async function safeGetSession() {
  try {
    return await getFullUserSession()
  } catch {
    return null
  }
}
