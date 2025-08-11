"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

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

export function TitularesTableRow({ titular }: TitularesTableRowProps) {
  const formattedCI = titular.ci ? `V-${titular.ci}` : "";

  const formattedCoverageAmount =
    titular.maxCoverageAmount !== undefined
      ? `USD ${titular.maxCoverageAmount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "";

  return (
    <TableRow>
      {/* Titular */}
      <TableCell className="pr-1 pl-6 w-[21%] text-foreground font-medium">
        <div>{titular.name}</div>
        {formattedCI && (
          <div className="text-sm text-muted-foreground">{formattedCI}</div>
        )}
      </TableCell>

      {/* Contacto */}
      <TableCell className="pl-1 pr-4 w-[20%] text-muted-foreground">
        <div>{titular.phone}</div>
        {titular.email && <div>{titular.email}</div>}
      </TableCell>

      {/* Póliza */}
      <TableCell className="pl-1 pr-6 w-[12%] text-muted-foreground">
        <div>{titular.policyNumber}</div>
        {titular.policyType && <div>{titular.policyType}</div>}
      </TableCell>

      {/* Compañía */}
      <TableCell className="px-6 w-[14%] text-muted-foreground">
        {titular.insuranceCompany}
      </TableCell>

      {/* Estado con más separación desde Compañía */}
      <TableCell className="pl-8 pr-6 w-[8%]">
        <span
          className={`px-3 py-1 rounded-full font-semibold text-sm ${
            titular.policyStatus === "Activo"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {titular.policyStatus}
        </span>
      </TableCell>

      {/* Cobertura */}
      <TableCell className="px-4 w-[13%] text-muted-foreground">
        <div>{titular.coverageType}</div>
        {formattedCoverageAmount && (
          <div className="text-sm">{formattedCoverageAmount}</div>
        )}
      </TableCell>

      {/* Pacientes */}
      <TableCell className="text-right pr-10 w-[6%] text-foreground font-medium">
        {titular.totalPatients?.toLocaleString() ?? 0}
      </TableCell>

      {/* Casos */}
      <TableCell className="text-right pl-12 w-[6%] text-foreground font-medium">
        {titular.totalCases?.toLocaleString() ?? 0}
      </TableCell>
    </TableRow>
  );
}
