"use client"

import Link from "next/link"
import Image from "next/image"
import { DollarSign, User, LogOut, Building2, BriefcaseMedical, LayoutDashboard, BadgeCheck, ChevronsUpDown } from 'lucide-react'

import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

import { logoutAction } from "@/app/actions"
import { AppSidebarContent } from "./sidebar-content"
import { Avatar, AvatarFallback } from "./ui/avatar"

interface NavItem {
  title: string
  href: string
  roles: string[]
}

interface NavSection {
  title: string
  items: NavItem[]
  icon: React.ElementType
  expandable?: boolean
  isActive?: boolean
}

export function AppSidebar({
  userRole,
  userEmail,
}: {
  userRole: string | null
  userEmail: string | null
}) {
  const { isMobile } = useSidebar()

  const navSections: NavSection[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      expandable: true,
      items: [
        { title: "Resumen de Titulares", href: "/dashboard/summary", roles: ["Superusuario"] },
        { title: "Titulares de Seguro", href: "/dashboard/insurance-holders", roles: ["Superusuario"] },
      ],
    },
    {
      title: "Casos Médicos",
      icon: BriefcaseMedical,
      expandable: true,
      items: [
        { title: "Listado de casos", href: "/cases-list", roles: ["Superusuario"] },
        { title: "Nuevo Caso", href: "/cases/new", roles: ["Superusuario"] },
        { title: "Mis Casos Asignados", href: "/analyst-dashboard", roles: ["Superusuario"] },
        { title: "Casos Pendientes Auditoría", href: "/auditor-dashboard", roles: ["Superusuario"] },
        { title: "Casos Anulados", href: "/cancelled-cases", roles: ["Superusuario"] },
      ],
    },
    {
      title: "Maestros",
      icon: Building2,
      expandable: true,
      items: [
        { title: "Convenios", href: "/clients", roles: ["Superusuario"] },
        { title: "Pacientes", href: "/patients", roles: ["Superusuario"] },
        { title: "Titulares de Seguro", href: "/insurance-holders", roles: ["Superusuario"] },
        { title: "Compañías de Seguros", href: "/insurance-companies", roles: ["Superusuario"] },
      ],
    },
    {
      title: "Financiero",
      icon: DollarSign,
      expandable: true,
      items: [
        { title: "Facturación", href: "/invoices", roles: ["Superusuario"] },
        { title: "Fondo Incurrido", href: "/incurred-fund", roles: ["Superusuario"] },
        { title: "Pagos", href: "/payments", roles: ["Superusuario"] },
      ],
    },
  ]

  // Filtrar secciones y elementos según rol del usuario
  const filteredNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => userRole && item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0)

  // Obtener iniciales del usuario
  const getUserInitials = (email: string | null) => {
    if (!email) return "U"
    return email.charAt(0).toUpperCase()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvaO09WlVAzYrDYJc_F8gz1RlQPNuWg8oJKQ&s"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CGM Sistema</span>
                  <span className="truncate text-xs">Gestión Médica</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <AppSidebarContent items={filteredNavSections} />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <User className="h-4 w-4" />
                  <span>{userEmail || "Usuario"}</span>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {getUserInitials(userEmail)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {userEmail?.split('@')[0] || "Usuario"}
                      </span>
                      <span className="truncate text-xs">{userEmail || "usuario@ejemplo.com"}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Mi Perfil
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutAction()}>
                  <LogOut />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
