"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  { name: 'Titulares', href: '/dashboard', icon: Users },
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

  if (!mounted) {
    return null
  }

  const SidebarItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-4 px-6 py-3 text-sm font-medium transition-all duration-200 relative",
          "hover:bg-gray-50 dark:hover:bg-gray-900/50",
          isActive
            ? "text-primary bg-primary/5 border-r-2 border-primary"
            : "text-gray-700 dark:text-gray-300"
        )}
      >
        <item.icon className={cn(
          "h-5 w-5 flex-shrink-0",
          isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
        )} />
        
        <span className="font-medium">
          {item.name}
        </span>

        {/* Indicador de activo - punto */}
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
        )}
      </Link>
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
          "w-64"
        )}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {/* Header con botón cerrar */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              Navegación
            </h2>
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <SidebarItem key={item.name} item={item} />
            ))}
          </div>
        </nav>

        {/* Footer - System Version */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
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