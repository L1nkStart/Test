"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
    />
  );
}

// Skeleton específico para la tabla de titulares
export function TitularesTableSkeleton() {
  return (
    <Card className="bg-card text-card-foreground border border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="w-1 h-6" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <div className="overflow-x-auto mx-auto max-w-[98%]">
          <div className="space-y-3">
            {/* Header skeleton */}
            <div className="flex gap-4 pb-2 border-b border-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            
            {/* Rows skeleton */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-2">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={j} className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para las stats cards
export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Skeleton completo para la página de titulares
export function TitularesSkeleton() {
  return (
    <div className="animate-in fade-in-50 duration-300">
      {/* Header section skeleton */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="w-full md:w-[28rem]">
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </section>

      {/* Stats cards skeleton */}
      <StatsCardsSkeleton />

      {/* Table skeleton */}
      <TitularesTableSkeleton />
    </div>
  );
}