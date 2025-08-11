"use client";

import React, { useState, useEffect } from "react";
import { UserDropdown } from "@/components/ui/UserDropdown";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleStorageChange = () => {
      const savedState = localStorage.getItem("sidebar-open");
      if (savedState) {
        setSidebarOpen(JSON.parse(savedState));
      } else {
        setSidebarOpen(false);
        localStorage.setItem("sidebar-open", JSON.stringify(false));
      }
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("sidebar-toggle", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("sidebar-toggle", handleStorageChange);
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebar-open", JSON.stringify(newState));
    window.dispatchEvent(new CustomEvent("sidebar-toggle"));
  };

  if (!mounted) return null;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 lg:py-6">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo: Toggle + Escudo + CGM/Sistema */}
        <div className="flex items-center min-w-0">
          {/* Botón hamburguesa solo cuando sidebar está cerrado */}
          <div
            className={cn(
              "transition-all duration-300 ease-out mr-3 sm:mr-4 md:mr-5 lg:mr-7",
              !sidebarOpen
                ? "opacity-100 scale-100 w-8 sm:w-9"
                : "opacity-0 scale-95 w-0 overflow-hidden"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 sm:w-9 sm:h-9 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={toggleSidebar}
              disabled={sidebarOpen}
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>

          {/* Escudo + CGM/Sistema (agrupados) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Escudo */}
            <div className="relative flex-shrink-0">
              <div className="w-6 h-7 sm:w-7 sm:h-8 md:w-8 md:h-9 lg:w-8 lg:h-10 relative">
                <svg
                  viewBox="0 0 24 28"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L22 6V14C22 20.5 17 25.5 12 28C7 25.5 2 20.5 2 14V6L12 2Z"
                    className="fill-primary/20 stroke-primary stroke-2"
                  />
                  <path
                    d="M12 6L18 8.5V14.5C18 18.5 15 21.5 12 23C9 21.5 6 18.5 6 14.5V8.5L12 6Z"
                    className="fill-primary/30"
                  />
                  <circle cx="12" cy="14" r="3" className="fill-primary" />
                </svg>
              </div>
            </div>

            {/* CGM + Sistema */}
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">
                CGM
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-tight truncate">
                Sistema
              </p>
            </div>
          </div>
        </div>

        {/* Usuario */}
        <div className="flex-shrink-0">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
