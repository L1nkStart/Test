"use client"

import { Sidebar, SidebarRail } from "@/components/ui/sidebar"
import { AppSidebarContent } from "@/components/sidebar/sidebar-content"
import { AppSidebarHeader } from "@/components/sidebar/sidebar-header"
import { UserOptions } from '@/components/user-options'

import { useIsMobile } from '@/hooks/use-mobile'

import { navSections } from "@/components/nav-sections"

import { UserSession } from "@/lib/auth"

export function AppSidebar({ session }: { session: UserSession | null }) {
  const userRole = session?.role || "Invitado"
  const userEmail = session?.email || ""
  const isMobile = useIsMobile()

  // Filtrar secciones y elementos según rol del usuario
  const filteredNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => userRole && item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />

      <AppSidebarContent items={filteredNavSections} />

      <UserOptions userEmail={userEmail} isMobile={isMobile} />

      <SidebarRail />
    </Sidebar>
  )
}
