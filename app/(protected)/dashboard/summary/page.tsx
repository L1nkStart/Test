import { fetchInsuranceHoldersStats } from "@/app/actions";
import { DemographicsSection } from "./components/demographics-section";
import { DistributionCharts } from "./components/distribution-charts";
import { MetricSelectorCard } from "./components/metric-selector-card";

export default async function DashboardSummary() {
    // Obtenemos las estadísticas. Si hay un error, usamos .catch() para
    // proporcionar un objeto con valores por defecto y evitar que la página se rompa.
    const stats = await fetchInsuranceHoldersStats();

    if (!stats || !stats.generalMetrics) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">No se pudieron cargar las estadísticas.</p>
                </div>
            </div>
        )
    }

    return (
        // Grid de 2 filas y con altura que llene la pantalla
        <div className="grid grid-rows-[auto_1fr] gap-4 h-full">
            {/* Sección de métricas (Fila 1 - Altura automática) */}
            <MetricSelectorCard
                generalMetrics={stats.generalMetrics}
                financialMetrics={stats.financialMetrics}
                actionableInsights={stats.actionableInsights}
            />

            {/* Sección de Demografía y Distribución (Fila 2 - Ocupa el resto del espacio) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <DistributionCharts distributions={stats.distributions} />
                </div>
                <div className="lg:col-span-1">
                    <DemographicsSection demographics={stats.demographics} />
                </div>
            </div>
        </div>
    )
}