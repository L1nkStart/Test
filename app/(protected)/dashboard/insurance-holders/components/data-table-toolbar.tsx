"use client"

import { type Table } from "@tanstack/react-table"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Filter } from "@/components/ui/filter"
import { filterOptions } from "@/app/(protected)/dashboard/insurance-holders/components/filter-options"
import { InsuranceHolderCreateButton } from "./create-button"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    return (
        <div className="flex justify-between">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar titulares..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                        className="pl-8"
                    />
                </div>

                {/* Filtro por Compañía de Seguros */}
                <Filter
                    filterKey="policyStatus"
                    placeholder="Filtrar por estado"
                    options={filterOptions.statusOptions}
                />

                {/* Filtro por Compañía de Seguros */}
                <Filter
                    filterKey="insuranceCompany"
                    placeholder="Filtrar por aseguradora"
                    options={filterOptions.companyOptions}
                />

                {/* Filtro por Tipo de Seguros */}
                <Filter
                    filterKey="policyType"
                    placeholder="Filtrar por tipo"
                    options={filterOptions.policyTypeOptions}
                />

                {/* Filtro por estado */}
                <Filter
                    filterKey="city"
                    placeholder="Filtrar por ciudad"
                    options={filterOptions.cityOptions}
                />
            </div>
            <div>
                <InsuranceHolderCreateButton />
            </div>
        </div>
    )
}