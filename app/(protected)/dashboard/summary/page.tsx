import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, FileText } from "lucide-react"
import { fetchInsuranceHoldersStats } from "@/app/actions";

export default async function DashboardSummary() {
    // Obtenemos las estadísticas. Si hay un error, usamos .catch() para
    // proporcionar un objeto con valores por defecto y evitar que la página se rompa.
    const stats = await fetchInsuranceHoldersStats().catch(err => {
        console.error("Error fetching dashboard stats:", err);
        return {
            totalHolders: 0,
            activePolicies: 0,
            totalPatients: 0,
            totalCases: 0,
        };
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Titulares</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalHolders}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pólizas Activas</CardTitle>
                    <Shield className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activePolicies}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPatients}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Casos</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCases}</div>
                </CardContent>
            </Card>
        </div>
    )
}