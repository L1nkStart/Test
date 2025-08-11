"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * PageSection: wrapper reutilizable para secciones principales.
 * Aplica bg-card, borde, sombra y radios consistentes (mejor UX).
 */
export function PageSection({
  children,
  className,
  contentClassName = "p-6",
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "bg-card text-card-foreground border border-border shadow-sm rounded-xl transition-shadow",
        "hover:shadow-md", // micro-elevación al hover
        className
      )}
    >
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
