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
        <div className="flex flex-col h-screen gap-6">
            {/* Sección de métricas */}
            <MetricSelectorCard
                generalMetrics={stats.generalMetrics}
                financialMetrics={stats.financialMetrics}
                actionableInsights={stats.actionableInsights}
            />

            {/* Sección de Demografía y Distribución */}
            <div className="flex gap-6 flex-1 min-h-0">
                <div className="flex-1 min-h-0 flex flex-col">
                    <DistributionCharts distributions={stats.distributions} />
                </div>
                <div className="w-1/3 min-h-0 flex flex-col">
                    <DemographicsSection demographics={stats.demographics} />
                </div>
            </div>

        </div>
    )
}