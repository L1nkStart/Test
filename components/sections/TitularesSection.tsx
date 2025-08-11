"use client";

import React, { useState, useEffect, Suspense } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TitularesTable } from "@/components/dashboard/TitularesTable";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination, PaginationInfo } from "@/components/ui/Pagination";
import { useSearchParams } from "next/navigation";
import { TitularesSkeleton } from "@/components/ui/SkeletonLoader";

interface InsuranceHolder {
  id: string;
  ci: string;
  name: string;
  phone: string;
  email?: string;
  policyNumber?: string;
  policyType?: string;
  insuranceCompany?: string;
  policyStatus?: string;
  coverageType?: string;
  maxCoverageAmount?: number;
  totalPatients?: number;
  totalCases?: number;
}

function TitularesContent() {
  const [titularesData, setTitularesData] = useState<InsuranceHolder[]>([]);
  const [filteredData, setFilteredData] = useState<InsuranceHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/insurance-holders");
        if (!res.ok) {
          throw new Error("Failed to fetch insurance holders data");
        }
        const data = await res.json();
        setTitularesData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(titularesData);
      setCurrentPage(1); // Reset page when clearing search
      return;
    }

    const filtered = titularesData.filter((titular) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        titular.name.toLowerCase().includes(searchLower) ||
        titular.ci.toLowerCase().includes(searchLower) ||
        titular.phone.toLowerCase().includes(searchLower) ||
        (titular.email && titular.email.toLowerCase().includes(searchLower)) ||
        (titular.policyNumber && titular.policyNumber.toLowerCase().includes(searchLower)) ||
        (titular.insuranceCompany && titular.insuranceCompany.toLowerCase().includes(searchLower))
      );
    });
    setFilteredData(filtered);
    setCurrentPage(1); // Reset page when searching
  }, [searchTerm, titularesData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table for better UX
    document.querySelector('[data-table-container]')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <TitularesSkeleton />;
  }

  return (
    <div className="animate-in fade-in-50 duration-500">
      {/* Header de sección */}
      <section className="space-y-4 sm:space-y-6 lg:flex lg:flex-row lg:items-center lg:justify-between lg:space-y-0 border-b border-border pb-4 sm:pb-6 lg:pb-4 mb-6 sm:mb-8">
        {/* Título y descripción */}
        <div className="space-y-1 sm:space-y-2 lg:space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-foreground">
            Titulares
          </h1>
          <p className="text-sm sm:text-base lg:text-base text-muted-foreground lg:whitespace-nowrap lg:overflow-hidden lg:text-ellipsis">
            Gestión de titulares de pólizas de seguro
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="w-full max-w-md lg:w-full lg:flex lg:justify-end">
          <div className="lg:w-[28rem]">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats cards con espaciado responsivo */}
      <div className="mb-6 sm:mb-8 lg:mb-8">
        <StatsCards data={titularesData} />
      </div>

      {/* Tabla con espaciado */}
      <div className="pb-4 sm:pb-6 lg:pb-0" data-table-container>
        <TitularesTable data={paginatedData} />
        
        {/* Paginación y info */}
        {filteredData.length > itemsPerPage && (
          <div className="mt-6 space-y-4">
            {/* Info de paginación */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <PaginationInfo
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredData.length}
                className="text-center sm:text-left"
              />
              
              {/* Controles de paginación */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TitularesSection() {
  return (
    <Suspense fallback={<TitularesSkeleton />}>
      <TitularesContent />
    </Suspense>
  );
}