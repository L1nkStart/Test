import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, CheckCircle, Users as UserGroup, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsuranceHolder {
  id: string;
  policyStatus?: string;
  totalPatients?: number;
  totalCases?: number;
}

interface StatsCardsProps {
  data: InsuranceHolder[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  iconClassName?: string;
  iconContainerClassName?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName = "text-muted-foreground",
  iconContainerClassName = "bg-muted",
}: StatCardProps) {
  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm rounded-xl hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              iconContainerClassName
            )}
          >
            <Icon className={cn("h-5 w-5", iconClassName)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold text-foreground">
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = {
    totalTitulares: data.length,
    polizasActivas: data.filter((h) => h.policyStatus === "Activo").length,
    totalPacientes: data.reduce((sum, h) => sum + (h.totalPatients || 0), 0),
    totalCasos: data.reduce((sum, h) => sum + (h.totalCases || 0), 0),
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Titulares"
        value={stats.totalTitulares}
        icon={Users}
        iconClassName="text-muted-foreground"
        iconContainerClassName="bg-muted"
      />

      <StatCard
        title="Pólizas Activas"
        value={stats.polizasActivas}
        icon={CheckCircle}
        iconClassName="text-green-600 dark:text-green-500"
        iconContainerClassName="bg-green-50 dark:bg-green-900/20"
      />

      <StatCard
        title="Total Pacientes"
        value={stats.totalPacientes}
        icon={UserGroup}
        iconClassName="text-muted-foreground"
        iconContainerClassName="bg-muted"
      />

      <StatCard
        title="Total Casos"
        value={stats.totalCasos}
        icon={FileText}
        iconClassName="text-muted-foreground"
        iconContainerClassName="bg-muted"
      />
    </div>
  );
}
