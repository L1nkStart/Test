// components/dashboard/actionable-insights.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Plus, BellRing } from "lucide-react"; // Importamos un nuevo ícono

interface ActionableInsightsProps {
    insights: {
        expiringIn30Days: number;
        expiringIn31_90Days: number;
        newPoliciesLast30Days: number;
    };
}

export function ActionableInsights({ insights }: ActionableInsightsProps) {
    const cards = [
        {
            title: "Vencen en 30 días",
            value: insights.expiringIn30Days.toLocaleString(),
            icon: AlertTriangle,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-950/20",
            description: "Atención inmediata",
        },
        {
            title: "Atención Requerida",
            value: (insights.expiringIn30Days + insights.expiringIn31_90Days).toLocaleString(),
            icon: BellRing,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950/20",
            description: "Total por vencer",
        },
        {
            title: "Vencen en 31-90 días",
            value: insights.expiringIn31_90Days.toLocaleString(),
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
            description: "Planificar renovación",
        },
        {
            title: "Nuevas (Últ. 30 días)",
            value: insights.newPoliciesLast30Days.toLocaleString(),
            icon: Plus,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950/20",
            description: "Crecimiento reciente",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
    );
}