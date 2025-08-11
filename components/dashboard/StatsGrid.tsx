import React from "react"
import { StatsCard } from "./StatsCard"
import { Users, CheckCircle, Users as UsersFamily, FileText } from "lucide-react"

interface InsuranceHolder {
  id: string
  policyStatus?: string
  totalPatients?: number
  totalCases?: number
}

interface StatsGridProps {
  data: InsuranceHolder[]
}

export function StatsGrid({ data }: StatsGridProps) {
  const stats = {
    totalTitulares: data.length,
    polizasActivas: data.filter(h => h.policyStatus === "Activo").length,
    totalPacientes: data.reduce((sum, h) => sum + (h.totalPatients || 0), 0),
    totalCasos: data.reduce((sum, h) => sum + (h.totalCases || 0), 0),
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Titulares"
        value={stats.totalTitulares}
        icon={Users}
        iconColor="text-gray-600"
      />
      <StatsCard
        title="Pólizas Activas"
        value={stats.polizasActivas}
        icon={CheckCircle}
        iconColor="text-green-600"
      />
      <StatsCard
        title="Total Pacientes"
        value={stats.totalPacientes}
        icon={UsersFamily}
        iconColor="text-gray-600"
      />
      <StatsCard
        title="Total Casos"
        value={stats.totalCasos}
        icon={FileText}
        iconColor="text-gray-600"
      />
    </div>
  )
}