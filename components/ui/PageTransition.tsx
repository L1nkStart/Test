"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function PageTransition({ children, isLoading = false, className }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isLoading 
          ? "opacity-50 scale-[0.98] blur-sm" 
          : "opacity-100 scale-100 blur-0 animate-in fade-in-0 slide-in-from-bottom-2",
        className
      )}
    >
      {children}
    </div>
  );
}