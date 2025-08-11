"use client";

import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TitularesTableRow } from "./TitularesTableRow";
import { useSearchParams } from "next/navigation";

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

interface TitularesTableProps {
  data: InsuranceHolder[];
}

function TitularesTableContent({ data }: TitularesTableProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  if (!data || data.length === 0) {
    return (
      <Card className="bg-card text-card-foreground border border-border">
        <CardHeader className="px-6 sm:px-6 lg:px-8 pt-6 pb-3 sm:pt-2 sm:pb-2 lg:pt-5 lg:pb-3">
          <CardTitle className="text-2xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Listado de Titulares
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 lg:px-2">
          <div className="text-center py-8 lg:py-8 text-muted-foreground lg:mx-auto lg:max-w-[98%]">
            {searchTerm ? 
              `No se encontraron titulares que coincidan con "${searchTerm}".` : 
              "No hay titulares de seguro para mostrar."
            }
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-card-foreground border border-border">
      <CardHeader className="px-6 sm:px-6 lg:px-8 pt-6 pb-3 sm:pt-2 sm:pb-2 lg:pt-5 lg:pb-3">
        <CardTitle className="text-2xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Listado de Titulares
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-0 lg:px-2">
        {/* Vista móvil - Cards */}
        <div className="block sm:hidden">
          <div className="space-y-3 p-4">
            {data.map((titular) => (
              <div key={titular.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">{titular.name}</h3>
                    <p className="text-sm text-muted-foreground">{titular.ci}</p>
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      titular.policyStatus === "Activo"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {titular.policyStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{titular.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Póliza</p>
                    <p className="font-medium">{titular.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Aseguradora</p>
                    <p className="font-medium truncate">{titular.insuranceCompany}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cobertura</p>
                    <p className="font-medium">{titular.coverageType}</p>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Pacientes</p>
                    <p className="font-semibold">{titular.totalPatients?.toLocaleString() ?? 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Casos</p>
                    <p className="font-semibold">{titular.totalCases?.toLocaleString() ?? 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vista tablet/desktop - Tabla */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto lg:mx-auto lg:max-w-[98%]">
            <div className="min-w-[800px] lg:min-w-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="px-3 lg:px-3 w-[20%] font-semibold text-muted-foreground text-sm">
                      Titular
                    </TableHead>
                    <TableHead className="px-3 lg:px-3 w-[22%] font-semibold text-muted-foreground text-sm">
                      Contacto
                    </TableHead>
                    <TableHead className="px-3 lg:px-3 w-[11%] font-semibold text-muted-foreground text-sm">
                      Póliza
                    </TableHead>
                    <TableHead className="pr-2 pl-3 lg:px-3 w-[15%] font-semibold text-muted-foreground text-sm">
                      Compañía
                    </TableHead>
                    <TableHead className="px-2 lg:px-2 w-[8%] font-semibold text-muted-foreground text-sm">
                      Estado
                    </TableHead>
                    <TableHead className="pr-6 pl-3 lg:px-3 w-[12%] font-semibold text-muted-foreground text-sm">
                      Cobertura
                    </TableHead>
                    <TableHead className="px-8 lg:px-8 w-[4%] font-semibold text-muted-foreground text-right text-sm">
                      Pacientes
                    </TableHead>
                    <TableHead className="pl-8 pr-3 lg:px-8 w-[4%] font-semibold text-muted-foreground text-right text-sm">
                      Casos
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((titular) => (
                    <TitularesTableRow key={titular.id} titular={titular} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TitularesTable({ data }: TitularesTableProps) {
  return (
    <Suspense fallback={
      <Card className="bg-card text-card-foreground border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Listado de Titulares</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="text-center py-8 text-muted-foreground mx-auto max-w-[98%]">
            Cargando...
          </div>
        </CardContent>
      </Card>
    }>
      <TitularesTableContent data={data} />
    </Suspense>
  );
}
