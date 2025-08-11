"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:block">
      {/* Header persistente - Mobile/Tablet: top, Desktop: original position */}
      <div className="lg:hidden">
        <Header />
      </div>
      
      {/* Desktop: Header siempre visible */}
      <div className="hidden lg:block">
        <Header />
      </div>
      
      {/* Sidebar persistente */}
      <div className="lg:block">
        <Sidebar />
      </div>
      
      {/* Contenido principal */}
      <main className="flex-1 min-h-screen bg-muted lg:px-6 lg:py-6 lg:pb-12">
        <div className="px-4 sm:px-6 lg:px-0 py-4 sm:py-6 lg:py-0">
          <div className="lg:max-w-none max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}