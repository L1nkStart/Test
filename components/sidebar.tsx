"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useDashboardContent } from "@/hooks/useDashboardContent"
import {
  ListTodo,
  Users,
  FileText,
  DollarSign,
  ClipboardList,
  XCircle,
  Scale,
  User,
  LogOut,
  PlusCircle,
  CreditCard,
  Banknote,
  Stethoscope,
  Building2,
  UserCheck,
  Shield,
  ShieldBan,
  Building,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { logoutAction } from "@/app/actions"

import { useSidebar } from "@/components/ui/use-sidebar"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: string[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

export function AppSidebar({
  userRole,
  userEmail,
  hide,
}: { userRole: string | null; userEmail: string | null; hide?: boolean }) {
  const pathname = usePathname()
  const { setOpen } = useSidebar()
  const { navigateToSection } = useDashboardContent()

  const navSections: NavSection[] = [
    {
      title: "Navegación",
      items: [
        {
          title: "Titulares",
          href: "/dashboard/titulares",
          icon: Shield,
          roles: ["Superusuario"],
        },
        {
          title: "Casos",
          href: "/dashboard/casos",
          icon: ListTodo,
          roles: ["Superusuario"],
        },
        {
          title: "Reportes",
          href: "/dashboard/reportes",
          icon: FileText,
          roles: ["Superusuario"],
        },
        {
          title: "Configuración",
          href: "/dashboard/configuracion",
          icon: Building2,
          roles: ["Superusuario"],
        },
        {
          title: "Ayuda",
          href: "/dashboard/ayuda",
          icon: UserCheck,
          roles: ["Superusuario"],
        },
      ],
    }
  ]

  // Filtrar secciones y elementos basados en el rol del usuario
  const filteredNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => userRole && item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0) // Solo mostrar secciones que tienen elementos accesibles


  //logo.png

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard/titulares" className="flex items-center gap-2 px-2 py-4">
          <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvaO09WlVAzYrDYJc_F8gz1RlQPNuWg8oJKQ&s" alt="Logo" width={40} height={40} className="rounded-full" />
          <span className="text-lg font-semibold">CGM Sistema</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {filteredNavSections.map((section) => (
          <SidebarGroup key={section.title}>
            {section.title === "Navegación" ? (
              <div className="flex items-center gap-3 pl-2 py-1">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <SidebarGroupLabel className="text-base font-semibold">{section.title}</SidebarGroupLabel>
              </div>
            ) : (
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const sectionKey = item.href.split('/').pop();
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        onClick={() => {
                          if (sectionKey && ['titulares', 'casos', 'reportes', 'configuracion', 'ayuda'].includes(sectionKey)) {
                            navigateToSection(sectionKey as any);
                            setOpen(false); // Cerrar sidebar en mobile
                          }
                        }}
                        isActive={pathname.startsWith(item.href)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User className="h-4 w-4" />
                  <span>{userEmail || "Usuario"}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
                <DropdownMenuItem>
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logoutAction()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
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
