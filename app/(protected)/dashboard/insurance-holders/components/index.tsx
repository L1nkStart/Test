// app/(...)/insurance-holders-table/index.tsx
"use client"

import * as React from "react"
import {
    type ColumnFiltersState,
    type SortingState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { InsuranceHolder } from "@/interfaces/insurance-holder"
import { getColumns } from "./colums"
import { DataTable } from "@/components/ui/data-table"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

interface InsuranceHoldersTableProps {
    data: InsuranceHolder[]
    canManageHolders: boolean
    pageCount: number
    currentPage: number
}

export function HoldersClientTable({ data, canManageHolders, pageCount, currentPage }: InsuranceHoldersTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = React.useState({})

    // Obtenemos las columnas desde el archivo separado, pasándole las dependencias
    const columns = React.useMemo(() => getColumns(canManageHolders), [canManageHolders]);

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: { sorting, columnFilters, rowSelection },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
    });

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('currentPage', String(page));
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="w-full space-y-4">
            <DataTableToolbar table={table} />
            <DataTable table={table} columnsLength={columns.length} />
            <DataTablePagination
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={handlePageChange}
            />
        </div>
    )
}