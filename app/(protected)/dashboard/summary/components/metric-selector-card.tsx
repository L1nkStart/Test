"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeneralMetricsCards } from "./general-metrics";
import { FinancialMetricsCards } from "./financial.metrics";
import { ActionableInsights } from "./actionable-insights";
import { LayoutGrid } from "lucide-react";

interface MetricSelectorCardProps {
    generalMetrics: any;
    financialMetrics: any;
    actionableInsights: any;
}

export function MetricSelectorCard({
    generalMetrics,
    financialMetrics,
    actionableInsights
}: MetricSelectorCardProps) {
    const [selectedView, setSelectedView] = useState("general");

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <LayoutGrid className="h-5 w-5" />
                    Métricas Principales
                </CardTitle>
                <Select value={selectedView} onValueChange={setSelectedView}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Ver métricas..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="general">Generales</SelectItem>
                        <SelectItem value="financial">Financieras</SelectItem>
                        <SelectItem value="actionable">Accionables</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                {selectedView === "general" && <GeneralMetricsCards metrics={generalMetrics} />}
                {selectedView === "financial" && <FinancialMetricsCards metrics={financialMetrics} />}
                {selectedView === "actionable" && <ActionableInsights insights={actionableInsights} />}
            </CardContent>
        </Card>
    );
}