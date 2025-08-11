"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

    return (
        <Card>
            <Tabs defaultValue="general" className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <LayoutGrid className="h-5 w-5" />
                        Métricas Principales
                    </CardTitle>
                    <TabsList>
                        <TabsTrigger value="general">Generales</TabsTrigger>
                        <TabsTrigger value="financial">Financieras</TabsTrigger>
                        <TabsTrigger value="actionable">Accionables</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="general">
                        <GeneralMetricsCards metrics={generalMetrics} />
                    </TabsContent>
                    <TabsContent value="financial">
                        <FinancialMetricsCards metrics={financialMetrics} />
                    </TabsContent>
                    <TabsContent value="actionable">
                        <ActionableInsights insights={actionableInsights} />
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    );
}
