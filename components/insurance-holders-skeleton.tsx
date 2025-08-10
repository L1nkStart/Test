import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function InsuranceHoldersSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Search Skeleton */}
            <Card>
                <CardContent className="p-4">
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>

            {/* Statistics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Skeleton */}
            <Card>
                <CardHeader className="bg-gray-100 rounded-t-lg">
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    {/* Pagination Info Skeleton */}
                    <div className="mb-4 flex items-center justify-between">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {Array.from({ length: 8 }).map((_, index) => (
                                        <TableHead key={index}>
                                            <Skeleton className="h-4 w-20" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {Array.from({ length: 8 }).map((_, colIndex) => (
                                            <TableCell key={colIndex}>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {/* Pagination Skeleton */}
                    <div className="mt-6 flex items-center justify-between">
                        <Skeleton className="h-4 w-48" />
                        <div className="flex gap-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-8 w-8" />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
