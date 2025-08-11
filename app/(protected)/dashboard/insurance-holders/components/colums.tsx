"use client"

import { type Column, type ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react"

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
import { cn } from "@/lib/utils" // Asegúrate de tener esta utilidad de clsx/tailwind-merge
import { InsuranceHolder } from "@/interfaces/insurance-holder"
import { getStatusColor, formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "./form-context"
import { useState, useTransition } from "react"
import { deleteUser } from "@/app/actions"


import { Trash2, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * Componente reutilizable para los encabezados de columna que permite la ordenación.
 * Muestra un ícono diferente según el estado de ordenación.
 */
interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
}



function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
    const SortIcon = () => {
        const sorted = column.getIsSorted()
        if (sorted === "desc") {
            return <ArrowDown className="ml-2 h-4 w-4" />
        }
        if (sorted === "asc") {
            return <ArrowUp className="ml-2 h-4 w-4" />
        }
        return <ArrowUpDown className="ml-2 h-4 w-4" />
    }

    return (
        <div className={cn("flex items-center space-x-2 ml-2", className)}>
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4 h-8 p-2 data-[state=open]:bg-accent hover:bg-accent/50 font-bold"
            >
                <span>{title}</span>
                <SortIcon />
            </Button>
        </div>
    )
}

const DataTableRowActions = ({ row }: { row: any }) => {

    const { toast } = useToast();
    // Hook del contexto para abrir el modal de edición
    const { openEditForm } = useForm();

    // Estado para controlar la apertura del diálogo de alerta
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    // Hook useTransition para manejar el estado de carga de la Server Action
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteUser(holder.id);

            if (result.success) {
                toast({
                    title: 'Éxito',
                    description: 'Titular de seguro eliminado correctamente.',
                });
                setIsAlertOpen(false); // Cierra el diálogo al tener éxito
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'No se pudo eliminar el titular.',
                    variant: 'destructive',
                });
            }
        });
    };

    const holder = row.original as InsuranceHolder
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(holder.id)}>Copiar ID del Titular</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditForm(holder)}>Editar titular</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className=" text-destructive focus:text-destructive">Eliminar titular</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>


            {/* Diálogo de Alerta para Confirmar Borrado */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al titular de seguro
                            <span className="font-semibold"> {holder.name}</span> y todos sus datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Sí, eliminar'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export const getColumns = (canManageHolders: boolean): ColumnDef<InsuranceHolder>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Titular" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Compañía" />,
        cell: ({ row }) => row.getValue("insuranceCompany") || "N/A",
    },
    {
        accessorKey: "policyStatus",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
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
    ...(canManageHolders
        ? [
            {
                id: "actions",
                cell: ({ row }: { row: any }) => <DataTableRowActions row={row} />,
            },
        ]
        : []),
]
