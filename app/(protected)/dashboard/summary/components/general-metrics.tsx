import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, ShieldX, ShieldAlert, Users } from "lucide-react"

interface GeneralMetricsCardsProps {
    metrics: {
        totalHolders: number
        activePolicies: number
        inactivePolicies: number
        expiredPolicies: number
    }
}

export function GeneralMetricsCards({ metrics }: GeneralMetricsCardsProps) {
    const cards = [
        {
            title: "Total Titulares",
            value: metrics.totalHolders.toLocaleString(),
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
        },
        {
            title: "Pólizas Activas",
            value: metrics.activePolicies.toLocaleString(),
            icon: ShieldCheck,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950/20",
        },
        {
            title: "Pólizas Inactivas",
            value: metrics.inactivePolicies.toLocaleString(),
            icon: ShieldX,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950/20",
        },
        {
            title: "Pólizas Vencidas",
            value: metrics.expiredPolicies.toLocaleString(),
            icon: ShieldAlert,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-950/20",
        },
    ]

    return (
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
    )
}
