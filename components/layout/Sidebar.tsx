"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDashboardContent } from "@/hooks/useDashboardContent"
import { cn } from "@/lib/utils"
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Menu,
  ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: 'Titulares', href: '/dashboard/titulares', icon: Users },
  { name: 'Casos', href: '/dashboard/casos', icon: FileText },
  { name: 'Reportes', href: '/dashboard/reportes', icon: BarChart3 },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
  { name: 'Ayuda', href: '/dashboard/ayuda', icon: HelpCircle },
]

// Hook para persistir el estado del sidebar
const useSidebarState = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedState = localStorage.getItem('sidebar-open')
          if (savedState) {
            setIsOpen(JSON.parse(savedState))
          } else {
            setIsOpen(false)
            localStorage.setItem('sidebar-open', JSON.stringify(false))
          }
        } catch (error) {
          console.error('Error loading sidebar state:', error)
          setIsOpen(false)
          localStorage.setItem('sidebar-open', JSON.stringify(false))
        }
      }
    }

    // Initial load
    handleStorageChange()

    // Listen for changes from other components
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('sidebar-toggle', handleStorageChange)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('sidebar-toggle', handleStorageChange)
      }
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isOpen
    setIsOpen(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-open', JSON.stringify(newState))
      window.dispatchEvent(new CustomEvent('sidebar-toggle'))
    }
  }

  return { isOpen, toggleSidebar, mounted }
}


export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggleSidebar, mounted } = useSidebarState()
  const { navigateToSection, loading, currentSection } = useDashboardContent()

  if (!mounted) {
    return null
  }

  const SidebarItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard/titulares' && pathname.startsWith(item.href))
    const section = item.href.split('/').pop()
    const isLoading = loading && section === currentSection
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      const section = item.href.split('/').pop()
      navigateToSection(section)
    }

    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium transition-all duration-200 relative text-left",
          "hover:bg-gray-50 dark:hover:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          isActive
            ? "text-primary bg-primary/5 border-r-2 border-primary"
            : "text-gray-700 dark:text-gray-300"
        )}
      >
        <item.icon className={cn(
          "h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0",
          isActive ? "text-primary" : "text-gray-500 dark:text-gray-400",
          isLoading && "animate-pulse"
        )} />
        
        <span className="font-medium text-sm sm:text-base truncate">
          {item.name}
        </span>

        {/* Indicador de activo - punto */}
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="ml-auto w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        )}
      </button>
    )
  }

  return (
    <>
      {/* Backdrop Overlay - Solo en móvil */}
      {isOpen && (
        <div 
          className={cn(
            "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden",
            "animate-in fade-in-0 duration-300"
          )}
          onClick={toggleSidebar}
          style={{
            animation: isOpen ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
          }}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800",
          "flex flex-col shadow-lg transition-all duration-500 ease-out",
          "w-64 sm:w-72 lg:w-64"
        )}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {/* Header con botón cerrar */}
        <div className="px-3 sm:px-4 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-1 h-5 sm:h-6 bg-primary rounded-full flex-shrink-0"></div>
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                Navegación
              </h2>
            </div>
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              aria-label="Cerrar sidebar"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 sm:py-4 overflow-y-auto">
          <div className="space-y-0.5 sm:space-y-1">
            {navigation.map((item) => (
              <SidebarItem key={item.name} item={item} />
            ))}
          </div>
        </nav>

        {/* Footer - System Version */}
        <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Sistema CGM v1.2.0
          </div>
        </div>
      </div>

      {/* Spacer para el contenido principal */}
      <div 
        className="shrink-0 hidden lg:block"
        style={{
          width: isOpen ? '256px' : '0px',
          transition: 'width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      />
    </>
  )
}