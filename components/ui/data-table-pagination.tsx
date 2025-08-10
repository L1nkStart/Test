"use client"

import { Button } from "@/components/ui/button"

interface DataTablePaginationProps {
    currentPage: number;
    pageCount: number;
    onPageChange: (page: number) => void;
}

export function DataTablePagination({ currentPage, pageCount, onPageChange }: DataTablePaginationProps) {
    return (
        <div className="flex items-center justify-end space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                Anterior
            </Button>
            <div className="flex items-center gap-1 text-sm font-medium">
                Página {currentPage} de {pageCount}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= pageCount}
            >
                Siguiente
            </Button>
        </div>
    )
}