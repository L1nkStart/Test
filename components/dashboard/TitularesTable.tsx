"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TitularesTableRow } from "./TitularesTableRow";

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

export function TitularesTable({ data }: TitularesTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card text-card-foreground border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Listado de Titulares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay titulares de seguro para mostrar.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-card-foreground border border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Listado de Titulares</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {" "}
        {/* Aquí bajamos el padding horizontal */}
        <div className="overflow-x-auto mx-auto max-w-[95%]">
          {" "}
          {/* centramos y reducimos el ancho */}
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-semibold text-muted-foreground">
                  Titular
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  Contacto
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  Póliza
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  Compañía
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  Estado
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  Cobertura
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground text-right">
                  Pacientes
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground text-right">
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
      </CardContent>
    </Card>
  );
}
