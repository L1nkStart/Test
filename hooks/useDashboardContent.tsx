"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type DashboardSection = 'titulares' | 'casos' | 'reportes' | 'configuracion' | 'ayuda';

interface DashboardState {
  currentSection: DashboardSection;
  loading: boolean;
  targetSection: DashboardSection | null;
  error: string | null;
}

export function useDashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [state, setState] = useState<DashboardState>({
    currentSection: 'titulares',
    loading: false,
    targetSection: null,
    error: null,
  });

  // Determinar la sección actual basada en la URL
  useEffect(() => {
    const section = pathname.split('/').pop() as DashboardSection;
    if (section && section !== state.currentSection) {
      setState(prev => ({ 
        ...prev, 
        currentSection: section,
        targetSection: null,
        loading: false,
        error: null 
      }));
    }
  }, [pathname, state.currentSection]);

  const navigateToSection = async (section: DashboardSection) => {
    if (section === state.currentSection) return;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      targetSection: section,
      error: null 
    }));

    try {
      // Navegar inmediatamente sin delay artificial
      router.push(`/dashboard/${section}`);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        targetSection: null, 
        error: 'Error al navegar a la sección' 
      }));
    }
  };

  return {
    currentSection: state.currentSection,
    loading: state.loading,
    targetSection: state.targetSection,
    error: state.error,
    navigateToSection,
  };
}