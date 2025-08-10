"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/search-input"
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious 
} from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { InsuranceHolderForm } from "@/components/insurance-holder-form"
import { InsuranceHoldersSkeleton } from "@/components/insurance-holders-skeleton"
import { Search, Shield, Users, FileText, Edit, Trash2, Plus } from "lucide-react"

interface InsuranceHolder {
    id: string
    ci: string
    name: string
    phone: string
    email?: string
    policyNumber?: string
    insuranceCompany?: string
    policyType?: string
    policyStatus?: string
    coverageType?: string
    maxCoverageAmount?: number
    usedCoverageAmount?: number
    totalCases: number
    totalPatients: number
    isActive: boolean
}

interface PaginationInfo {
    currentPage: number
    totalPages: number
    totalRecords: number
    limit: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

export default function InsuranceHoldersPage() {
    const [holders, setHolders] = useState<InsuranceHolder[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingHolder, setEditingHolder] = useState<InsuranceHolder | null>(null)
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
    
    // Estados para paginación del servidor
    const [currentPage, setCurrentPage] = useState(1)
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false
    })
    
    // Estados para estadísticas
    const [stats, setStats] = useState({
        totalHolders: 0,
        activePolicies: 0,
        totalPatients: 0,
        totalCases: 0
    })
    
    // Estados para estadísticas filtradas
    const [filteredStats, setFilteredStats] = useState({
        totalHolders: 0,
        activePolicies: 0,
        totalPatients: 0,
        totalCases: 0
    })
    

    
    const { toast } = useToast()

    // Memoizar fetchHolders para evitar recreaciones innecesarias
    const fetchHolders = useCallback(async (page: number = 1, search: string = "") => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10"
            })
            
            if (search.trim()) {
                params.append("search", search.trim())
            }
            
            const response = await fetch(`/api/insurance-holders?${params}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch insurance holders: ${response.statusText}`)
            }
            
            const result = await response.json()
            
            // Si es una búsqueda específica (id, ci, policyNumber), devuelve un objeto único
            if (result.id) {
                setHolders([result])
                setPaginationInfo({
                    currentPage: 1,
                    totalPages: 1,
                    totalRecords: 1,
                    limit: 10,
                    hasNextPage: false,
                    hasPreviousPage: false
                })
            } else {
                // Respuesta paginada normal
                setHolders(result.data || [])
                setPaginationInfo(result.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalRecords: 0,
                    limit: 10,
                    hasNextPage: false,
                    hasPreviousPage: false
                })
            }
            
            // Actualizar estadísticas filtradas
            await fetchFilteredStats(search)
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.")
            toast({
                title: "Error",
                description: err.message || "Failed to load insurance holders.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    // Funciones de paginación - MOVIDAS AQUÍ para cumplir con las reglas de Hooks
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
        fetchHolders(page, searchTerm)
    }, [fetchHolders, searchTerm])

    const handlePreviousPage = useCallback(() => {
        if (paginationInfo.hasPreviousPage) {
            const newPage = currentPage - 1
            setCurrentPage(newPage)
            fetchHolders(newPage, searchTerm)
        }
    }, [paginationInfo.hasPreviousPage, currentPage, fetchHolders, searchTerm])

    const handleNextPage = useCallback(() => {
        if (paginationInfo.hasNextPage) {
            const newPage = currentPage + 1
            setCurrentPage(newPage)
            fetchHolders(newPage, searchTerm)
        }
    }, [paginationInfo.hasNextPage, currentPage, fetchHolders, searchTerm])

    const fetchCurrentUserRole = async () => {
        try {
            const response = await fetch("/api/current-user-role")
            if (response.ok) {
                const data = await response.json()
                setCurrentUserRole(data.role || null)
            }
        } catch (error) {
            console.error("Error fetching user role:", error)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch("/api/insurance-holders/stats")
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        }
    }

    const fetchFilteredStats = async (search: string = "") => {
        try {
            const params = new URLSearchParams()
            if (search.trim()) {
                params.append("search", search.trim())
            }
            
            const response = await fetch(`/api/insurance-holders/stats?${params}`)
            if (response.ok) {
                const data = await response.json()
                setFilteredStats(data)
            }
        } catch (error) {
            console.error("Error fetching filtered stats:", error)
        }
    }

    // Funciones CRUD - MOVIDAS AQUÍ para cumplir con las reglas de Hooks
    const handleCreateHolder = useCallback(async (newHolderData: any) => {
        try {
            const response = await fetch("/api/insurance-holders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newHolderData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create insurance holder.")
            }

            toast({
                title: "Éxito",
                description: "Titular de seguro creado correctamente.",
                variant: "default",
            })
            fetchHolders(currentPage, searchTerm)
            fetchStats() // Actualizar estadísticas
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Error al crear el titular de seguro.",
                variant: "destructive",
            })
        }
    }, [fetchHolders, currentPage, searchTerm, fetchStats, toast])

    const handleUpdateHolder = useCallback(async (updatedHolderData: any) => {
        if (!editingHolder) return

        try {
            const response = await fetch(`/api/insurance-holders?id=${editingHolder.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedHolderData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update insurance holder.")
            }

            toast({
                title: "Éxito",
                description: "Titular de seguro actualizado correctamente.",
                variant: "default",
            })
            fetchHolders(currentPage, searchTerm)
            fetchStats() // Actualizar estadísticas
            setEditingHolder(null)
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Error al actualizar el titular de seguro.",
                variant: "destructive",
            })
        }
    }, [editingHolder, fetchHolders, currentPage, searchTerm, fetchStats, toast])

    const handleDeleteHolder = useCallback(async (id: string) => {
        if (!confirm("¿Está seguro de que desea eliminar este titular de seguro?")) return

        try {
            const response = await fetch(`/api/insurance-holders?id=${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to delete insurance holder.")
            }

            toast({
                title: "Éxito",
                description: "Titular de seguro eliminado correctamente.",
                variant: "default",
            })
            fetchHolders(currentPage, searchTerm)
            fetchStats() // Actualizar estadísticas
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Error al eliminar el titular de seguro.",
                variant: "destructive",
            })
        }
    }, [fetchHolders, currentPage, searchTerm, fetchStats, toast])

    useEffect(() => {
        fetchHolders(1, searchTerm)
        fetchCurrentUserRole()
        fetchStats()
    }, [fetchHolders])

    // Debounce optimizado para la búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== "") {
                setCurrentPage(1) // Reset a la primera página
                fetchHolders(1, searchTerm)
            } else if (searchTerm === "") {
                // Cuando el término de búsqueda está vacío, mostrar todos los registros
                setCurrentPage(1) // Reset a la primera página
                fetchHolders(1, "")
            }
        }, 500) // Aumentar el debounce a 500ms para mejor UX

        return () => clearTimeout(timeoutId)
    }, [searchTerm, fetchHolders])

    const openEditForm = (holder: InsuranceHolder) => {
        setEditingHolder(holder)
        setIsFormOpen(true)
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        setEditingHolder(null)
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "activo":
                return "bg-green-500 text-white border-green-500"
            case "pendiente":
                return "bg-orange-500 text-white border-orange-500"
            case "vencido":
                return "bg-red-500 text-white border-red-500"
            case "suspendido":
                return "bg-amber-500 text-white border-amber-500"
            case "cancelado":
                return "bg-red-500 text-white border-red-500"
            case "inactivo":
                return "bg-red-500 text-white border-red-500"
            default:
                return "bg-gray-500 text-white border-gray-500"
        }
    }

    const getPolicyTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case "salud":
                return "bg-blue-500 text-white border-blue-500"
            case "automóvil":
                return "bg-cyan-500 text-white border-cyan-500"
            case "vida":
                return "bg-green-500 text-white border-green-500"
            case "hogar":
                return "bg-orange-500 text-white border-orange-500"
            default:
                return "bg-gray-500 text-white border-gray-500"
        }
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return "N/A"
        return new Intl.NumberFormat("es-VE", {
            style: "currency",
            currency: "USD",
        }).format(amount)
    }

    const canManageHolders = currentUserRole === "Superusuario" || currentUserRole === "Coordinador Regional"

    if (loading) {
        return <InsuranceHoldersSkeleton />
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-insurance-coral">{error}</div>
    }

    // Calcular índices para mostrar
    const startIndex = (paginationInfo.currentPage - 1) * paginationInfo.limit + 1
    const endIndex = Math.min(startIndex + paginationInfo.limit - 1, paginationInfo.totalRecords)

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-semibold text-lg md:text-2xl text-insurance-blue-deep">Titulares de Seguro</h1>
                    <p className="text-muted-foreground">Gestión de titulares de pólizas de seguro</p>
                </div>
                {canManageHolders && (
                    <Button onClick={() => setIsFormOpen(true)} className="bg-insurance-blue-deep hover:bg-insurance-blue-deep/90 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Titular
                    </Button>
                )}
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar por nombre, cédula, teléfono, email o número de póliza..."
                        className="w-full"
                        onClear={() => {
                            setCurrentPage(1)
                            fetchHolders(1, "")
                        }}
                    />
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-insurance-blue-deep"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-insurance-gray-neutral">Total Titulares</CardTitle>
                        <Users className="h-4 w-4 text-insurance-blue-deep" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-insurance-blue-deep">{stats.totalHolders}</div>
                        {searchTerm && (
                            <div className="text-sm text-muted-foreground">
                                Filtrados: {filteredStats.totalHolders}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-insurance-emerald"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-insurance-gray-neutral">Pólizas Activas</CardTitle>
                        <Shield className="h-4 w-4 text-insurance-emerald" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-insurance-emerald">{stats.activePolicies}</div>
                        {searchTerm && (
                            <div className="text-sm text-muted-foreground">
                                Filtradas: {filteredStats.activePolicies}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-insurance-blue-sky"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-insurance-gray-neutral">Total Pacientes</CardTitle>
                        <Users className="h-4 w-4 text-insurance-blue-sky" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-insurance-blue-sky">{stats.totalPatients}</div>
                        {searchTerm && (
                            <div className="text-sm text-muted-foreground">
                                Filtrados: {filteredStats.totalPatients}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-insurance-amber"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-insurance-gray-neutral">Total Casos</CardTitle>
                        <FileText className="h-4 w-4 text-insurance-amber" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-insurance-amber">{stats.totalCases}</div>
                        {searchTerm && (
                            <div className="text-sm text-muted-foreground">
                                Filtrados: {filteredStats.totalCases}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Holders Table */}
            <Card>
                <CardHeader className="bg-insurance-blue-deep text-white rounded-t-lg">
                    <CardTitle>Listado de Titulares</CardTitle>
                </CardHeader>
                <CardContent>
                    {holders.length > 0 ? (
                        <>
                            {/* Información de paginación superior */}
                            <div className="mb-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {startIndex} a {endIndex} de {paginationInfo.totalRecords} resultados
                                </div>
                                {paginationInfo.totalPages > 1 && (
                                    <div className="text-sm text-muted-foreground">
                                        Página {paginationInfo.currentPage} de {paginationInfo.totalPages}
                                    </div>
                                )}
                            </div>
                            
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-black font-bold">Titular</TableHead>
                                            <TableHead className="text-black font-bold">Contacto</TableHead>
                                            <TableHead className="text-black font-bold">Póliza</TableHead>
                                            <TableHead className="text-black font-bold">Compañía</TableHead>
                                            <TableHead className="text-black font-bold">Estado</TableHead>
                                            <TableHead className="text-black font-bold">Cobertura</TableHead>
                                            <TableHead className="text-black font-bold">Pacientes</TableHead>
                                            <TableHead className="text-black font-bold">Casos</TableHead>
                                            {canManageHolders && <TableHead className="text-black font-bold">Acciones</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {holders.map((holder) => (
                                            <TableRow key={holder.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{holder.name}</div>
                                                        <div className="text-sm text-muted-foreground">{holder.ci}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="text-sm">{holder.phone}</div>
                                                        {holder.email && <div className="text-sm text-blue-600 underline">{holder.email}</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="text-sm font-medium">{holder.policyNumber || "N/A"}</div>
                                                        {holder.policyType && (
                                                            <Badge variant="outline" className={getPolicyTypeColor(holder.policyType)}>
                                                                {holder.policyType}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{holder.insuranceCompany || "N/A"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getStatusColor(holder.policyStatus || "")}>
                                                        {holder.policyStatus || "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="text-sm font-medium">{holder.coverageType || "N/A"}</div>
                                                        <div className="text-sm text-green-600 font-medium">
                                                            {formatCurrency(holder.maxCoverageAmount)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{holder.totalPatients}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{holder.totalCases}</Badge>
                                                </TableCell>
                                                {canManageHolders && (
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => openEditForm(holder)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteHolder(holder.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {/* Paginación */}
                            {paginationInfo.totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Mostrando {startIndex} a {endIndex} de {paginationInfo.totalRecords} resultados
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious 
                                                    onClick={handlePreviousPage}
                                                    className={!paginationInfo.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            
                                            {/* Números de página */}
                                            {Array.from({ length: paginationInfo.totalPages }, (_, i) => i + 1).map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(page)}
                                                        isActive={paginationInfo.currentPage === page}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            
                                            <PaginationItem>
                                                <PaginationNext 
                                                    onClick={handleNextPage}
                                                    className={!paginationInfo.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No hay titulares de seguro para mostrar.</p>
                    )}
                </CardContent>
            </Card>

            {/* Form Dialog */}
            {isFormOpen && (
                <InsuranceHolderForm
                    isOpen={isFormOpen}
                    onCloseAction={handleFormClose}
                    onSaveAction={editingHolder ? handleUpdateHolder : handleCreateHolder}
                    initialData={editingHolder}
                />
            )}
        </main>
    )
}
