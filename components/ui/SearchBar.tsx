"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

function SearchBarComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("search", term);
    else params.delete("search");
    router.replace(`/dashboard/titulares?${params.toString()}`);
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return (
    <div className="relative w-full max-w-md lg:max-w-none">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none z-10" />
      <Input
        placeholder="Buscar por nombre, cédula, teléfono, email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 sm:py-3 lg:py-6 w-full bg-card text-sm lg:text-base text-foreground placeholder:text-muted-foreground border-border focus-visible:ring-primary rounded-lg lg:rounded-md transition-all duration-200"
      />
    </div>
  );
}

export function SearchBar() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full max-w-md lg:max-w-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none z-10" />
          <Input
            placeholder="Buscar por nombre, cédula, teléfono, email..."
            disabled
            className="pl-10 pr-4 py-2 sm:py-3 lg:py-6 w-full bg-card text-sm lg:text-base text-foreground placeholder:text-muted-foreground border-border rounded-lg lg:rounded-md"
          />
        </div>
      }
    >
      <SearchBarComponent />
    </Suspense>
  );
}
