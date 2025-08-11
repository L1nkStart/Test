"use client"

import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, LogOut, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { logoutAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  email?: string
  name?: string
  role?: string
}

export function UserDropdown() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<UserData | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/current-user-role")
      if (response.ok) {
        const data = await response.json()
        setUser({
          email: data.session?.email || "admin@cgm.com",
          name: data.session?.name || "Admin Usuario",
          role: data.role
        })
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Fallback data
      setUser({
        email: "admin@cgm.com",
        name: "Admin Usuario",
        role: "Superusuario"
      })
    }
  }

  const getUserInitials = () => {
    if (user?.name) {
      // Solo la primera letra del nombre
      return user.name.charAt(0).toUpperCase()
    }
    return 'A'
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      toast({
        title: "Cerrando sesión...",
        description: "Hasta pronto. Esperamos verte de nuevo.",
        variant: "success",
      })
      
      // Small delay to show the toast before redirect
      setTimeout(async () => {
        await logoutAction()
      }, 1000)
    } catch (error) {
      console.error("Error during logout:", error)
      toast({
        title: "Error al cerrar sesión",
        description: "Ocurrió un problema. Intente nuevamente.",
        variant: "destructive",
      })
      setIsLoggingOut(false)
    }
  }

  if (!mounted) {
    return (
      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus-visible:outline-none">
          <AvatarImage src="/placeholder-avatar.png" alt="Avatar" />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-base">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        className="w-60 bg-popover text-popover-foreground border border-border shadow-md rounded-md"
        sideOffset={8}
      >
        {/* User info header - without avatar */}
        <div className="p-3 border-b border-border">
          <div className="text-sm font-semibold text-foreground truncate">
            {user?.email || 'admin@cgm.com'}
          </div>
          {user?.role && (
            <div className="text-xs text-muted-foreground mt-1">
              {user.role}
            </div>
          )}
        </div>

        {/* Menu items */}
        <div className="py-1">
          <DropdownMenuItem 
            onClick={toggleTheme} 
            className="cursor-pointer px-3 py-2 text-sm hover:bg-muted focus:bg-muted transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="mr-3 h-4 w-4" />
                Modo Oscuro
              </>
            ) : (
              <>
                <Sun className="mr-3 h-4 w-4" />
                Modo Claro
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-1 border-border" />
          
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer px-3 py-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="mr-3 h-4 w-4" />
            {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}