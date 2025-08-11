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

interface Stats {
  totalTitulares: number;
  polizasActivas: number;
  totalPacientes: number;
  totalCasos: number;
}

interface StatsCardsProps {
  data: InsuranceHolder[];
  stats?: Stats;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  iconClassName?: string;
}

const StatCard = React.memo(function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName = "text-muted-foreground",
}: StatCardProps) {
  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm rounded-xl hover:shadow-md transition-shadow">
      <CardHeader className="py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:px-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm lg:text-sm text-muted-foreground font-medium line-clamp-2 lg:line-clamp-none">
            {title}
          </p>
          <Icon className={cn("h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0", iconClassName)} />
        </div>
      </CardHeader>
      <CardContent className="py-2 sm:py-3 lg:py-5 px-3 sm:px-4 lg:px-5">
        <div className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground leading-tight">
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
});

export const StatsCards = React.memo(function StatsCards({ data, stats: providedStats }: StatsCardsProps) {
  const calculatedStats = React.useMemo(() => ({
    totalTitulares: data.length,
    polizasActivas: data.filter((h) => h.policyStatus === "Activo").length,
    totalPacientes: data.reduce((sum, h) => sum + (h.totalPatients || 0), 0),
    totalCasos: data.reduce((sum, h) => sum + (h.totalCases || 0), 0),
  }), [data]);

  // Use provided stats if available, otherwise calculate from data
  const stats = providedStats || calculatedStats;

  const statsData = [
    {
      title: "Total Titulares",
      value: stats.totalTitulares,
      icon: Users,
      iconClassName: "text-muted-foreground"
    },
    {
      title: "Pólizas Activas", 
      value: stats.polizasActivas,
      icon: CheckCircle,
      iconClassName: "text-green-600 dark:text-green-500"
    },
    {
      title: "Total Pacientes",
      value: stats.totalPacientes,
      icon: UserGroup,
      iconClassName: "text-muted-foreground"
    },
    {
      title: "Total Casos",
      value: stats.totalCasos,
      icon: FileText,
      iconClassName: "text-muted-foreground"
    }
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {statsData.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          iconClassName={stat.iconClassName}
        />
      ))}
    </div>
  );
});
