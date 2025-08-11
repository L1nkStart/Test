"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Se importan los Tabs
import { ChartBarBig, MapPin, TrendingUp } from "lucide-react"

interface DistributionChartsProps {
    distributions: {
        byCompany: Record<string, number>
        byPolicyType: Record<string, number>
        byCity: Record<string, number>
        byAgeGroup: Record<string, number>
    }
}

const chartConfig = {
    byCompany: { label: "Aseguradora" },
    byPolicyType: { label: "Tipo de Póliza" },
    byCity: { label: "Ciudad", icon: MapPin },
    byAgeGroup: { label: "Grupo de Edad" },
} satisfies ChartConfig

export function DistributionCharts({ distributions }: DistributionChartsProps) {
    // El estado se mantiene para saber qué gráfico mostrar y para el footer dinámico
    const [activeChart, setActiveChart] = useState<keyof typeof distributions>("byCompany")

    // useMemo para optimizar la transformación de datos
    const dataMap = useMemo(() => ({
        byCompany: Object.entries(distributions.byCompany).map(([name, value]) => ({ name, value })),
        byPolicyType: Object.entries(distributions.byPolicyType).map(([name, value]) => ({ name, value })),
        byCity: Object.entries(distributions.byCity).map(([name, value]) => ({ name, value })),
        byAgeGroup: Object.entries(distributions.byAgeGroup).map(([name, value]) => ({ name, value })),
    }), [distributions]);

    const currentChartData = dataMap[activeChart]

    return (
        <Card className="flex flex-col h-full">
            <Tabs defaultValue={activeChart} className="flex flex-col flex-1" onValueChange={(value) => setActiveChart(value as keyof typeof distributions)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <ChartBarBig />
                        Gráficos de Distribución
                    </CardTitle>
                    {/* El Select se reemplaza por la lista de Tabs */}
                    <TabsList>
                        {Object.entries(chartConfig).map(([key, config]) => (
                            <TabsTrigger key={key} value={key}>
                                {config.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                    {/* El contenido del gráfico ahora está dentro de TabsContent, pero sigue siendo dinámico */}
                    <TabsContent value={activeChart} className="h-full">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart accessibilityLayer data={currentChartData} margin={{ top: 20, right: 80, left: 80, bottom: 40 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        stroke="hsl(var(--muted-foreground))"
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 14 }}
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="value" fill={"var(--chart-2)"} radius={8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    )
}
