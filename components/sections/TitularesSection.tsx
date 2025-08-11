"use client";

import React, {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TitularesTable } from "@/components/dashboard/TitularesTable";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination, PaginationInfo } from "@/components/ui/Pagination";
import { useSearchParams } from "next/navigation";
import { TitularesSkeleton } from "@/components/ui/SkeletonLoader";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilterWorker } from "@/hooks/useFilterWorker";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const searchParams = useSearchParams();
  const rawSearchTerm = searchParams.get("search") || "";

  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(rawSearchTerm, 300);

  // Web Worker for heavy filtering operations
  const { filteredData, stats, filterData, isFiltering } = useFilterWorker();

  // Function to fetch data
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const res = await fetch("/api/insurance-holders");
      if (!res.ok) {
        throw new Error("Failed to fetch insurance holders data");
      }
      const data = await res.json();
      setTitularesData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      if (isRefresh) {
        // Small delay for smooth animation
        setTimeout(() => setRefreshing(false), 300);
      }
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data when search term changes or data is loaded
  useEffect(() => {
    if (titularesData.length > 0) {
      filterData(titularesData, debouncedSearchTerm);
      setCurrentPage(1); // Reset pagination
    }
  }, [debouncedSearchTerm, titularesData, filterData]);

  // Memoize pagination data for paginated view
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      paginatedData,
    };
  }, [filteredData, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    document
      .querySelector("[data-table-container]")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

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

        {/* Controles superiores */}
        <div className="w-full max-w-md lg:w-full lg:max-w-4xl lg:flex lg:justify-end">
          {/* Layout móvil */}
          <div className="lg:hidden">
            {/* Barra de búsqueda - más alta en móvil */}
            <div className="mb-3">
              <SearchBar className="h-12" />
            </div>

            {/* Botón de refresh - debajo en móvil, alineado a la derecha */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(true)}
                disabled={refreshing || isFiltering}
                className="flex items-center gap-1.5 h-9 px-3 text-xs"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>Actualizar</span>
              </Button>
            </div>
          </div>

          {/* Layout desktop - botón a la izquierda de la búsqueda */}
          <div className="hidden lg:flex lg:items-center lg:gap-4 lg:w-full lg:max-w-none">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing || isFiltering}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Actualizar</span>
            </Button>

            <div className="flex-1">
              <SearchBar className="h-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats cards con espaciado responsivo */}
      <div className="mb-6 sm:mb-8 lg:mb-8">
        <StatsCards data={filteredData} stats={stats} />
      </div>

      {/* Indicador de estado solo para refresh */}
      {refreshing && (
        <div className="mb-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Actualizando datos...</span>
          </div>
        </div>
      )}

      {/* Tabla con espaciado */}
      <div className="pb-4 sm:pb-6 lg:pb-0" data-table-container>
        <TitularesTable data={paginationData.paginatedData} />

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
                totalPages={paginationData.totalPages}
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
