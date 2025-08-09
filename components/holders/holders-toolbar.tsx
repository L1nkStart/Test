"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

export function HoldersToolbar({
  q: initialQ,
  status: initialStatus,
  company: initialCompany,
  perPage: initialPerPage,
  sort: initialSort,
  companies = [],
}: { q: string; status: string; company: string; perPage: number; sort: string; companies?: string[] }) {
  const [q, setQ] = useState(initialQ)
  const [status, setStatus] = useState(initialStatus || "Todos")
  const [company, setCompany] = useState(initialCompany || "Todas")
  const [perPage, setPerPage] = useState(String(initialPerPage))
  const [sort, setSort] = useState(initialSort || "name.asc")

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setQ(initialQ)
    setStatus(initialStatus || "Todos")
    setCompany(initialCompany || "Todas")
    setPerPage(String(initialPerPage))
    setSort(initialSort || "name.asc")
  }, [initialQ, initialStatus, initialCompany, initialPerPage, initialSort])

  function applyFilters(page = 1) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    params.set("perPage", perPage)
    params.set("q", q)
    if (status !== "Todos") params.set("status", status)
    else params.delete("status")
    if (company !== "Todas") params.set("company", company)
    else params.delete("company")
    params.set("sort", sort)
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearFilters() {
    setQ("")
    setStatus("Todos")
    setCompany("Todas")
    setSort("name.asc")
    setPerPage("10")
    router.push(`${pathname}?page=1&perPage=10`)
  }

  const activeChips: Array<{ key: string; label: string; onClear: () => void }> = []
  if (q) activeChips.push({ key: "q", label: `Búsqueda: ${q}`, onClear: () => setQ("") })
  if (status !== "Todos")
    activeChips.push({ key: "status", label: `Estado: ${status}`, onClear: () => setStatus("Todos") })
  if (company !== "Todas")
    activeChips.push({ key: "company", label: `Compañía: ${company}`, onClear: () => setCompany("Todas") })

  const options =
    companies && companies.length ? companies : ["Seguros Caracas", "Mapfre", "Mercantil", "Banesco Seguros"]

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-end md:justify-between md:p-4">
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--accent))]" />
          <Input
            placeholder="Buscar por nombre, cédula, teléfono, email o póliza"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters(1)
            }}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Estado de póliza" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Suspendido">Suspendido</SelectItem>
            <SelectItem value="Vencido">Vencido</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger>
            <SelectValue placeholder="Compañía" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
            {options.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select value={perPage} onValueChange={setPerPage}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name.asc">Nombre (A-Z)</SelectItem>
            <SelectItem value="name.desc">Nombre (Z-A)</SelectItem>
            <SelectItem value="policyStatus.asc">Estado (A-Z)</SelectItem>
            <SelectItem value="policyStatus.desc">Estado (Z-A)</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => applyFilters(1)} className="gap-2">
          <Filter className="h-4 w-4" />
          Aplicar
        </Button>
        <Button variant="outline" onClick={clearFilters}>
          Limpiar
        </Button>
      </div>

      {/* Chips de filtros activos */}
      <div className="flex flex-wrap gap-2 md:col-span-4">
        {activeChips.map((chip) => (
          <span key={chip.key} className="chip">
            {chip.label}
            <button
              aria-label={`Quitar ${chip.key}`}
              onClick={() => {
                chip.onClear()
                setTimeout(() => applyFilters(1), 0)
              }}
              title="Quitar filtro"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
