import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsuranceHolderButtonActions } from "./button-actions";
import { fetchFilteredInsuranceHolders } from "@/app/actions";
import { getFullUserSession } from "@/lib/auth";

// --- Helper Functions ---
const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
        case "activo":
            return "bg-green-100 text-green-800 border-green-200";
        case "suspendido":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "vencido":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "cancelado":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("es-VE", {
        style: "currency",
        currency: "USD",
    }).format(amount);
};

// Tabla de Titulares

export async function InsuranceHoldersTable({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) {

    const [holders, session] = await Promise.all([
        fetchFilteredInsuranceHolders(query, currentPage),
        getFullUserSession(),
    ]);

    const currentUserRole = session?.role;
    const canManageHolders =
        currentUserRole === "Superusuario" || currentUserRole === "Coordinador Regional";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Listado de Titulares</CardTitle>
            </CardHeader>
            <CardContent>
                {holders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Titular</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Póliza</TableHead>
                                    <TableHead>Compañía</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Cobertura</TableHead>
                                    <TableHead>Pacientes</TableHead>
                                    <TableHead>Casos</TableHead>
                                    {canManageHolders && <TableHead>Acciones</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {holders.map((holder) => (
                                    <TableRow key={holder.id}>
                                        <TableCell>
                                            <div className="font-medium">{holder.name}</div>
                                            <div className="text-sm text-muted-foreground">{holder.ci}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{holder.phone}</div>
                                            {holder.email && (
                                                <div className="text-sm text-muted-foreground">{holder.email}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{holder.policyNumber || "N/A"}</div>
                                            <div className="text-sm text-muted-foreground">{holder.policyType || "N/A"}</div>
                                        </TableCell>
                                        <TableCell>{holder.insuranceCompany || "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(holder.policyStatus)}>
                                                {holder.policyStatus || "N/A"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{holder.coverageType || "N/A"}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatCurrency(holder.maxCoverageAmount)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{holder.totalPatients}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{holder.totalCases}</Badge>
                                        </TableCell>
                                        {canManageHolders && (
                                            <TableCell className="text-right">
                                                <InsuranceHolderButtonActions holder={holder} />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        No se encontraron titulares con los filtros actuales.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
