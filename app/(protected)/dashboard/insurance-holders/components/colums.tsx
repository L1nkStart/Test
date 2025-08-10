"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { InsuranceHolder } from "@/interfaces/insurance-holder"
import { getStatusColor, formatCurrency } from "@/lib/utils"

/**
 * Componente para el menú desplegable de acciones por fila.
 * Mantiene la definición de las columnas más limpia.
 */
const DataTableRowActions = ({ row }: { row: any }) => {
    const holder = row.original as InsuranceHolder

    // Aquí puedes añadir la lógica para navegar, abrir modales, etc.
    const handleViewDetails = () => console.log("Ver detalles de:", holder.id)
    const handleEdit = () => console.log("Editar:", holder.id)
    const handleDelete = () => console.log("Eliminar:", holder.id)

    return (
        <div className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(holder.id)}>
                        Copiar ID del Titular
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleViewDetails}>
                        Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEdit}>
                        Editar titular
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                        Eliminar titular
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

/**
 * Función que genera y exporta las definiciones de las columnas para la tabla de titulares.
 * @param canManageHolders - Booleano para mostrar condicionalmente la columna de acciones.
 * @returns Un array de ColumnDef<InsuranceHolder>.
 */
export const getColumns = (canManageHolders: boolean): ColumnDef<InsuranceHolder>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 p-0 hover:bg-transparent"
                >
                    Titular
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const holder = row.original
            return (
                <div>
                    <div className="font-medium">{holder.name}</div>
                    <div className="text-sm text-muted-foreground">{holder.ci}</div>
                </div>
            )
        },
    },
    {
        accessorKey: "contact",
        header: "Contacto",
        cell: ({ row }) => {
            const holder = row.original
            return (
                <div>
                    <div className="text-sm">{holder.phone}</div>
                    {holder.email && <div className="text-sm text-muted-foreground">{holder.email}</div>}
                </div>
            )
        },
    },
    {
        accessorKey: "policy",
        header: "Póliza",
        cell: ({ row }) => {
            const holder = row.original
            return (
                <div>
                    <div className="text-sm font-medium">{holder.policyNumber || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{holder.policyType || "N/A"}</div>
                </div>
            )
        },
    },
    {
        accessorKey: "insuranceCompany",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 p-0 hover:bg-transparent"
                >
                    Compañía
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => row.getValue("insuranceCompany") || "N/A",
    },
    {
        accessorKey: "policyStatus",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 p-0 hover:bg-transparent"
                >
                    Estado
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("policyStatus") as string
            return (
                <Badge variant="outline" className={getStatusColor(status)}>
                    {status || "N/A"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "coverage",
        header: "Cobertura",
        cell: ({ row }) => {
            const holder = row.original
            return (
                <div>
                    <div className="text-sm font-medium">{holder.coverageType || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(holder.maxCoverageAmount)}</div>
                </div>
            )
        },
    },
    {
        accessorKey: "totalCases",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 p-0 hover:bg-transparent"
                >
                    Casos
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const count = row.getValue("totalCases") as number
            return <Badge variant="secondary">{count}</Badge>
        },
    },
    // Columna de acciones que se muestra condicionalmente
    ...(canManageHolders
        ? [
            {
                id: "actions",
                cell: ({ row }: { row: any }) => <DataTableRowActions row={row} />,
            },
        ]
        : []),
]