"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

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
  address?: string | null
  city?: string | null
  state?: string | null
}

export function HolderDetailsSheet({
  id,
  open,
  onOpenChange,
}: {
  id: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [holder, setHolder] = useState<Holder | null>(null)
  useEffect(() => {
    let ignore = false
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const res = await fetch(`/api/insurance-holders?id=${encodeURIComponent(id)}`, { cache: "no-store" })
        const data = await res.json()
        if (!ignore) setHolder(data)
      } catch {
        if (!ignore) setHolder(null)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (open) load()
    return () => {
      ignore = true
    }
  }, [id, open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalle del titular</SheetTitle>
        </SheetHeader>
        {loading ? (
          <div className="py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : !holder ? (
          <div className="py-8 text-sm text-muted-foreground">No se encontraron datos.</div>
        ) : (
          <div className="space-y-4">
            <Card className="ent-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{holder.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">CI</div>
                  <div className="font-medium">{holder.ci}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Teléfono</div>
                  <div className="font-medium">{holder.phone}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-medium">{holder.email || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Compañía</div>
                  <div className="font-medium">{holder.insuranceCompany || "—"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="ent-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Póliza</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Número</div>
                  <div className="font-medium">{holder.policyNumber || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Tipo</div>
                  <div className="font-medium">{holder.policyType || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Estado</div>
                  <Badge variant="outline" className="capitalize">
                    {holder.policyStatus || "—"}
                  </Badge>
                </div>
                <div>
                  <div className="text-muted-foreground">Cobertura</div>
                  <div className="font-medium">{holder.coverageType || "—"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground">Monto</div>
                  <div className="font-medium">
                    {formatCurrency(holder.usedCoverageAmount)} / {formatCurrency(holder.maxCoverageAmount)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
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
