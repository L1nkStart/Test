"use client"

import { type Table as TanstackTable, flexRender } from "@tanstack/react-table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps<TData> {
    table: TanstackTable<TData>
    columnsLength: number
}

export function DataTable<TData>({ table, columnsLength }: DataTableProps<TData>) {
    return (
        <div className="rounded-lg border shadow-sm bg-card">
            <ScrollArea className="relative h-[60vh]">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b-0 bg-background">
                                {headerGroup.headers.map((header, index) => {
                                    const isFirstHeader = index === 0;
                                    const isLastHeader = index === headerGroup.headers.length - 1;
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={`sticky top-0 z-10 border-b bg-inherit px-4 text-sm font-bold text-muted-foreground ${isFirstHeader ? 'rounded-tl-lg' : ''
                                                } ${isLastHeader ? 'rounded-tr-lg' : ''}`}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="even:bg-background hover:bg-accent/40 data-row"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columnsLength} className="h-24 text-center text-muted-foreground">
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    )
}
