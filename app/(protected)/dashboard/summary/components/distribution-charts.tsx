"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts"
import { ChartBarBig, MapPin } from "lucide-react"

interface DistributionChartsProps {
    distributions: {
        byCompany: Record<string, number>
        byPolicyType: Record<string, number>
        byCity: Record<string, number>
        byAgeGroup: Record<string, number>
    }
}

const chartConfig = {
    byCompany: { label: "Por Aseguradora" },
    byPolicyType: { label: "Por Tipo de Póliza" },
    byCity: { label: "Por Ciudad", icon: MapPin },
    byAgeGroup: { label: "Por Grupo de Edad" },
} satisfies ChartConfig

export function DistributionCharts({ distributions }: DistributionChartsProps) {
    const [selectedChartKey, setSelectedChartKey] = useState<keyof typeof dataMap>("byCompany")

    const dataMap = {
        byCompany: Object.entries(distributions.byCompany).map(([name, value]) => ({ name, value })),
        byPolicyType: Object.entries(distributions.byPolicyType).map(([name, value]) => ({ name, value })),
        byCity: Object.entries(distributions.byCity).map(([name, value]) => ({ name, value })),
        byAgeGroup: Object.entries(distributions.byAgeGroup).map(([name, value]) => ({ name, value })),
    }

    const currentChartData = dataMap[selectedChartKey]

    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <ChartBarBig />
                    Gráficos de Distribución
                </CardTitle>
                <Select value={selectedChartKey} onValueChange={(value) => setSelectedChartKey(value as keyof typeof dataMap)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar gráfico" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(chartConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                                {config.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                <ChartContainer config={chartConfig} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart accessibilityLayer data={currentChartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} interval={0} height={80} />
                            <YAxis stroke="var(--foreground)" fontSize={12} tick={false} axisLine={false} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="value" fill={"var(--chart-2)"} radius={10} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}