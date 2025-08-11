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
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-card text-card-foreground border border-border shadow-sm rounded-xl">
          <CardHeader className="py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:px-5">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </div>
          </CardHeader>
          <CardContent className="py-2 sm:py-3 lg:py-5 px-3 sm:px-4 lg:px-5">
            <Skeleton className="h-6 sm:h-8 lg:h-10 w-16 lg:w-20" />
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
      <section className="space-y-4 sm:space-y-6 lg:flex lg:flex-row lg:items-center lg:justify-between lg:space-y-0 border-b border-border pb-4 sm:pb-6 lg:pb-4 mb-6 sm:mb-8">
        <div className="space-y-1 sm:space-y-2 lg:space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center lg:w-full lg:justify-end">
          <Skeleton className="h-10 w-24 sm:w-auto" />
          <div className="w-full max-w-md lg:w-[28rem]">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </section>

      {/* Stats cards skeleton */}
      <div className="mb-6 sm:mb-8 lg:mb-8">
        <StatsCardsSkeleton />
      </div>

      {/* Table skeleton */}
      <div className="pb-4 sm:pb-6 lg:pb-0">
        <TitularesTableSkeleton />
      </div>
    </div>
  );
}