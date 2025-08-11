import React from "react"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { TitularesTable } from "@/components/dashboard/TitularesTable"
import { SearchBar } from "@/components/ui/SearchBar"

async function getTitularesData() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/insurance-holders`, {
    next: { revalidate: 60 }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch insurance holders data');
  }
  
  return res.json();
}

export default async function TitularesPage() {
  const titularesData = await getTitularesData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Titulares de Seguro
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestión de titulares de pólizas de seguro
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Statistics Cards */}
      <StatsGrid data={titularesData} />

      {/* Titulares Table */}
      <TitularesTable data={titularesData} />
    </div>
  )
}