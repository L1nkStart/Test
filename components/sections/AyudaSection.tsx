"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export function AyudaSection() {
  return (
    <div className="animate-in fade-in-50 duration-500">
      {/* Header de sección */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Ayuda
          </h1>
          <p className="mt-1 text-muted-foreground">
            Centro de ayuda y soporte técnico
          </p>
        </div>
      </section>

      {/* Contenido placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Centro de Ayuda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Sección en desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}