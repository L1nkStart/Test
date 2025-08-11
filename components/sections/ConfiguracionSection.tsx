"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function ConfiguracionSection() {
  return (
    <div className="animate-in fade-in-50 duration-500">
      {/* Header de sección */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Configuración
          </h1>
          <p className="mt-1 text-muted-foreground">
            Configuración del sistema y preferencias
          </p>
        </div>
      </section>

      {/* Contenido placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Sección en desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}