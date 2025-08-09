"use client"

import { useEffect, useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Columns2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionsCell } from "./actions-cell"
import { HolderDetailsSheet } from "./holder-details-sheet"

type Holder = {
  id: string
  ci: string
  name: string
  phone: string
  email?: string | null
  policyNumber?: string | null
  policyType?: string | null
  policyStatus?: string | null
  insuranceCompany?: string | null
  coverageType?: string | null
  maxCoverageAmount?: number | null
  usedCoverageAmount?: number | null
  totalPatients?: number | null
  totalCases?: number | null
  isActive?: boolean | number | null
}

const DEFAULT_COLUMNS = [
  { key: "titular", label: "Titular", default: true },
  { key: "contacto", label: "Contacto", default: true },
  { key: "poliza", label: "Póliza", default: true },
  { key: "company", label: "Compañía", default: true },
  { key: "estado", label: "Estado", default: true },
  { key: "cobertura", label: "Cobertura", default: true },
  { key: "pacientes", label: "Pacientes", default: true },
  { key: "casos", label: "Casos", default: true },
  { key: "acciones", label: "Acciones", default: true },
]

const STORAGE_KEY = "holders:visible-columns"

export function HoldersTable({ items, canManage }: { items: Holder[]; canManage: boolean }) {
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setVisible(JSON.parse(saved))
    else {
      const init: Record<string, boolean> = {}
      DEFAULT_COLUMNS.forEach((c) => (init[c.key] = c.default))
      setVisible(init)
    }
  }, [])

  useEffect(() => {
    if (Object.keys(visible).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(visible))
  }, [visible])

  const [openId, setOpenId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const openDetails = (id: string) => {
    setOpenId(id)
    setOpen(true)
  }

  const columns = useMemo(() => DEFAULT_COLUMNS, [])

  return (
    <>
      <div className="flex items-center justify-end p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Columns2 className="h-4 w-4" />
              Columnas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Visibilidad</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                checked={!!visible[c.key]}
                onCheckedChange={(v) => setVisible((prev) => ({ ...prev, [c.key]: Boolean(v) }))}
              >
                {c.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto">
        <Table className="ent-compact">
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow className="hover:bg-transparent">
              {visible.titular && <TableHead className="min-w-[220px]">Titular</TableHead>}
              {visible.contacto && <TableHead className="min-w-[200px]">Contacto</TableHead>}
              {visible.poliza && <TableHead className="min-w-[200px]">Póliza</TableHead>}
              {visible.company && <TableHead className="min-w-[160px]">Compañía</TableHead>}
              {visible.estado && <TableHead className="min-w-[120px]">Estado</TableHead>}
              {visible.cobertura && <TableHead className="min-w-[220px]">Cobertura</TableHead>}
              {visible.pacientes && <TableHead className="min-w-[110px]">Pacientes</TableHead>}
              {visible.casos && <TableHead className="min-w-[90px]">Casos</TableHead>}
              {visible.acciones && <TableHead className="min-w-[120px] text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    [
                      visible.titular,
                      visible.contacto,
                      visible.poliza,
                      visible.company,
                      visible.estado,
                      visible.cobertura,
                      visible.pacientes,
                      visible.casos,
                      visible.acciones,
                    ].filter(Boolean).length || 1
                  }
                  className="text-center py-12 text-muted-foreground"
                >
                  No hay titulares que coincidan con los filtros.
                </TableCell>
              </TableRow>
            ) : (
              items.map((h) => {
                const used = Number(h.usedCoverageAmount || 0)
                const max = Number(h.maxCoverageAmount || 0)
                const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
                return (
                  <TableRow key={h.id} className="hover:bg-muted/40">
                    {visible.titular && (
                      <TableCell>
                        <button
                          className="text-left w-full"
                          onClick={() => openDetails(h.id)}
                          aria-label="Ver detalle"
                          title="Ver detalle"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{h.name}</span>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-muted-foreground text-xs">{h.ci}</span>
                        </button>
                      </TableCell>
                    )}
                    {visible.contacto && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{h.phone}</span>
                          {h.email ? <span className="text-xs text-muted-foreground">{h.email}</span> : null}
                        </div>
                      </TableCell>
                    )}
                    {visible.poliza && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{h.policyNumber || "N/A"}</span>
                          <span className="text-xs text-muted-foreground">{h.policyType || "—"}</span>
                        </div>
                      </TableCell>
                    )}
                    {visible.company && <TableCell className="text-sm">{h.insuranceCompany || "N/A"}</TableCell>}
                    {visible.estado && (
                      <TableCell>
                        <StatusBadge status={h.policyStatus} />
                      </TableCell>
                    )}
                    {visible.cobertura && (
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{h.coverageType || "Cobertura"}</span>
                            <span className="font-medium">
                              {formatCurrency(used)} / {formatCurrency(max)}
                            </span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      </TableCell>
                    )}
                    {visible.pacientes && (
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {h.totalPatients ?? 0}
                        </Badge>
                      </TableCell>
                    )}
                    {visible.casos && (
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {h.totalCases ?? 0}
                        </Badge>
                      </TableCell>
                    )}
                    {visible.acciones && (
                      <TableCell className="text-right">
                        <ActionsCell holder={h as any} />
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <HolderDetailsSheet id={openId} open={open} onOpenChange={setOpen} />
    </>
  )
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || "").toLowerCase()
  const cls =
    s === "activo"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : s === "suspendido"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : s === "vencido"
          ? "bg-orange-100 text-orange-800 border-orange-200"
          : s === "cancelado"
            ? "bg-red-100 text-red-800 border-red-200"
            : "bg-gray-100 text-gray-800 border-gray-200"
  return (
    <Badge variant="outline" className={cn("capitalize", cls)}>
      {status || "N/A"}
    </Badge>
  )
}

function formatCurrency(amount?: number | null) {
  if (amount == null) return "N/A"
  try {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(Number(amount))
  } catch {
    return `$${Number(amount).toFixed(2)}`
  }
}
