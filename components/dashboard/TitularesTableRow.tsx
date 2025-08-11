"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Building2 } from "lucide-react";

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

interface TitularesTableRowProps {
  titular: InsuranceHolder;
}

export const TitularesTableRow = React.memo(function TitularesTableRow({ titular }: TitularesTableRowProps) {
  const formattedCI = titular.ci || "";

  const formattedCoverageAmount =
    titular.maxCoverageAmount !== undefined
      ? `USD ${titular.maxCoverageAmount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "";

  return (
    <TableRow>
      {/* Titular - 20% */}
      <TableCell className="px-3 lg:px-3 w-[20%] text-foreground font-medium">
        <div className="truncate text-sm lg:text-base lg:font-bold">{titular.name}</div>
        {formattedCI && (
          <div className="text-xs lg:text-sm text-muted-foreground">{formattedCI}</div>
        )}
      </TableCell>

      {/* Contacto - 22% */}
      <TableCell className="px-3 lg:px-3 w-[22%] text-muted-foreground">
        <div className="text-sm lg:text-base lg:font-bold lg:text-foreground">{titular.phone}</div>
        {titular.email && <div className="text-xs lg:text-sm truncate">{titular.email}</div>}
      </TableCell>

      {/* Póliza - 11% */}
      <TableCell className="px-3 lg:px-3 w-[11%] text-muted-foreground">
        <div className="font-medium text-sm lg:text-base lg:font-bold lg:text-foreground">{titular.policyNumber}</div>
        {titular.policyType && <div className="text-xs lg:text-sm">{titular.policyType}</div>}
      </TableCell>

      {/* Compañía - 15% */}
      <TableCell className="pr-2 pl-3 lg:px-3 w-[15%] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
          <div className="truncate text-sm lg:text-base">{titular.insuranceCompany}</div>
        </div>
      </TableCell>

      {/* Estado - 8% */}
      <TableCell className="px-2 lg:px-2 w-[8%]">
        <span
          className={`px-2 py-1 rounded-full font-semibold text-xs whitespace-nowrap ${
            titular.policyStatus === "Activo"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {titular.policyStatus}
        </span>
      </TableCell>

      {/* Cobertura - 12% */}
      <TableCell className="pr-6 pl-3 lg:px-3 w-[12%] text-muted-foreground">
        <div className="text-sm whitespace-nowrap lg:font-bold lg:text-foreground">{titular.coverageType}</div>
        {formattedCoverageAmount && (
          <div className="text-sm font-medium whitespace-nowrap">{formattedCoverageAmount}</div>
        )}
      </TableCell>

      {/* Pacientes - 4% */}
      <TableCell className="px-8 lg:px-8 w-[4%] text-right text-foreground font-medium text-sm lg:text-base">
        {titular.totalPatients?.toLocaleString() ?? 0}
      </TableCell>

      {/* Casos - 4% */}
      <TableCell className="pl-8 pr-3 lg:px-8 w-[4%] text-right text-foreground font-medium text-sm lg:text-base">
        {titular.totalCases?.toLocaleString() ?? 0}
      </TableCell>
    </TableRow>
  );
});
