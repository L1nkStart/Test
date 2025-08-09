"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { InsuranceHolderForm } from "@/components/insurance-holder-form"

type Holder = {
  id: string
  ci: string
  name: string
  phone: string
  email?: string
  policyNumber?: string
  policyType?: string
  policyStatus?: string
  insuranceCompany?: string
  coverageType?: string
  maxCoverageAmount?: number
  usedCoverageAmount?: number
  totalCases?: number
  totalPatients?: number
  isActive?: boolean
}

export function ActionsCell({ holder }: { holder: Holder }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const onSave = async (data: Partial<Holder>) => {
    try {
      const res = await fetch(`/api/insurance-holders?id=${holder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || "No se pudo actualizar el titular.")
      }
      toast({ title: "Éxito", description: "Titular actualizado." })
      window.location.reload()
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Error al actualizar.", variant: "destructive" })
    }
  }

  const onDelete = async () => {
    if (!confirm("¿Eliminar este titular?")) return
    try {
      const res = await fetch(`/api/insurance-holders?id=${holder.id}`, { method: "DELETE" })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || "No se pudo eliminar el titular.")
      }
      toast({ title: "Éxito", description: "Titular eliminado." })
      window.location.reload()
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Error al eliminar.", variant: "destructive" })
    }
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} aria-label="Editar titular">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} aria-label="Eliminar titular">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {open && (
        <InsuranceHolderForm isOpen={open} onClose={() => setOpen(false)} onSave={onSave} initialData={holder as any} />
      )}
    </>
  )
}

ActionsCell.CreateButton = function CreateButton() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const onSave = async (data: any) => {
    try {
      const res = await fetch(`/api/insurance-holders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || "No se pudo crear el titular.")
      }
      toast({ title: "Éxito", description: "Titular creado." })
      window.location.reload()
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Error al crear.", variant: "destructive" })
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Crear Titular
      </Button>
      {open && <InsuranceHolderForm isOpen={open} onClose={() => setOpen(false)} onSave={onSave} initialData={null} />}
    </>
  )
}
