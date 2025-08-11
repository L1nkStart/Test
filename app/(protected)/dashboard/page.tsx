import React from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TitularesTable } from "@/components/dashboard/TitularesTable";
import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/ui/SearchBar";

async function getTitularesData() {
  const res = await fetch(
    `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/api/insurance-holders`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch insurance holders data");
  }

  return res.json();
}

export default async function DashboardPage() {
  const titularesData = await getTitularesData();

  return (
    <>
      {/* Top bar */}
      <Header />

      {/* Contenedor con fondo sutil */}
      <main className="px-6 md:px-8 py-6 bg-muted min-h-screen">
        <div className="space-y-6 w-full">
          {/* Header de sección extremos opuestos */}
          <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
            {/* Izquierda */}
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Titulares
              </h1>
              <p className="mt-1 text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                Gestión de titulares de pólizas de seguro
              </p>
            </div>

            {/* Derecha */}
            <div className="w-full flex md:justify-end">
              <div className="w-full md:w-[28rem]">
                <SearchBar />
              </div>
            </div>
          </section>

          {/* Stats cards */}
          <StatsCards data={titularesData} />

          {/* Tabla */}
          <TitularesTable data={titularesData} />
        </div>
      </main>
    </>
  );
}
