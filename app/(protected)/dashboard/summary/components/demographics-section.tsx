"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users, Calendar } from "lucide-react";

interface DemographicsSectionProps {
    demographics: {
        averageAge: number;
        femaleHolders: number;
        maleHolders: number;
    };
}

const chartConfig = {
    Mujeres: {
        label: "Mujeres",
        color: "var(--chart-1)", // Variable de global.css
    },
    Hombres: {
        label: "Hombres",
        color: "var(--chart-2)", // Variable de global.css
    },
} satisfies ChartConfig;

export function DemographicsSection({ demographics }: DemographicsSectionProps) {
    const genderData = [
        { name: "Mujeres", value: demographics.femaleHolders },
        { name: "Hombres", value: demographics.maleHolders },
    ];

    const total = demographics.femaleHolders + demographics.maleHolders;

    // Helper para generar un color de fondo claro con opacidad
    const getBackgroundColor = (color: string) => {
        if (color.startsWith("hsl")) {
            // Convierte hsl(x y z) a hsla(x y z / 0.1)
            return color.replace("hsl", "hsla").replace(")", " / 0.1)");
        }
        return color; // Fallback
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Users className="h-5 w-5" />
                    Demografía
                </CardTitle>
            </CardHeader>
            {/* 4. El CardContent ahora es flexible y crece para llenar el espacio */}
            <CardContent className="flex flex-col flex-1 justify-between gap-6">

                {/* Edad Promedio */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Edad Promedio</span>
                    </div>
                    <span className="text-lg font-bold">{demographics.averageAge} años</span>
                </div>

                {/* Contenedor principal para el gráfico y las estadísticas de género */}
                <div className="flex-1 flex flex-col justify-around gap-4">
                    <h4 className="text-sm font-medium">Distribución por Género</h4>

                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={"40%"}
                                    outerRadius={"80%"}
                                    dataKey="value"
                                >
                                    {genderData.map((entry) => (
                                        <Cell
                                            key={`cell-${entry.name}`}
                                            fill={`var(--color-${entry.name})`}
                                        />
                                    ))}
                                </Pie>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="grid grid-cols-2 gap-2">
                        <div
                            className="text-center p-2 rounded text-secondary-foreground"
                            style={{
                                backgroundColor: getBackgroundColor(chartConfig.Mujeres.color),
                            }}
                        >
                            <div className="text-lg font-bold">
                                {demographics.femaleHolders}
                            </div>
                            <div className="text-xs">
                                {((demographics.femaleHolders / total) * 100).toFixed(1)}% Mujeres
                            </div>
                        </div>
                        <div
                            className="text-center p-2 rounded"
                            style={{
                                backgroundColor: getBackgroundColor(chartConfig.Hombres.color),
                            }}
                        >
                            <div className="text-lg font-bold text-primary-foreground">
                                {demographics.maleHolders}
                            </div>
                            <div className="text-xs text-primary-foreground">
                                {((demographics.maleHolders / total) * 100).toFixed(1)}% Hombres
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}