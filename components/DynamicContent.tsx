"use client";

import React from "react";
import { useDashboardContent } from "@/hooks/useDashboardContent";
import { TitularesSection } from "@/components/sections/TitularesSection";
import { CasosSection } from "@/components/sections/CasosSection";
import { ReportesSection } from "@/components/sections/ReportesSection";
import { ConfiguracionSection } from "@/components/sections/ConfiguracionSection";
import { AyudaSection } from "@/components/sections/AyudaSection";
import { TitularesSkeleton } from "@/components/ui/SkeletonLoader";
import { PageTransition } from "@/components/ui/PageTransition";

export function DynamicContent() {
  const { currentSection, loading, targetSection } = useDashboardContent();

  // Solo mostrar loading cuando navegamos a una sección diferente
  const showLoadingForSection = loading && targetSection && targetSection !== currentSection;

  if (showLoadingForSection) {
    return (
      <PageTransition isLoading={true}>
        <TitularesSkeleton />
      </PageTransition>
    );
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'titulares':
        return <TitularesSection />;
      case 'casos':
        return <CasosSection />;
      case 'reportes':
        return <ReportesSection />;
      case 'configuracion':
        return <ConfiguracionSection />;
      case 'ayuda':
        return <AyudaSection />;
      default:
        return <TitularesSection />;
    }
  };

  return (
    <PageTransition isLoading={loading}>
      {renderSection()}
    </PageTransition>
  );
}