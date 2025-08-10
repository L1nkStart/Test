import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calculator, Percent } from "lucide-react"

interface FinancialMetricsCardsProps {
    metrics: {
        totalInsuredValue: number
        totalUsedCoverage: number
        averagePolicyValue: number
        coverageUsagePercentage: number
    }
}

export function FinancialMetricsCards({ metrics }: FinancialMetricsCardsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const cards = [
        {
            title: "Valor Total Asegurado",
            value: formatCurrency(metrics.totalInsuredValue),
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950/20",
        },
        {
            title: "Cobertura Utilizada",
            value: formatCurrency(metrics.totalUsedCoverage),
            icon: TrendingUp,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
        },
        {
            title: "Valor Promedio Póliza",
            value: formatCurrency(metrics.averagePolicyValue),
            icon: Calculator,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950/20",
        },
        {
            title: "% Uso de Cobertura",
            value: `${metrics.coverageUsagePercentage.toFixed(1)}%`,
            icon: Percent,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950/20",
        },
    ]

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <Card key={index} className="transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
