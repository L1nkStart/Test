"use client"

import { Button } from "@/components/ui/button"
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet"
import { MenuIcon } from "lucide-react"
import { AppSidebarContent } from "@/components/sidebar/sidebar-content"
import { AppSidebarHeader } from "@/components/sidebar/sidebar-header"
import { UserOptions } from "@/components/user-options"
import { useIsMobile } from "@/hooks/use-mobile"
import { navSections } from "@/components/interfaces/nav-sections"
import { useSession } from "@/components/session-provider"

export function MobileHeader() {
  const session = useSession();
  const userRole = session?.role || "Invitado"
  const isMobile = useIsMobile()

  if (!isMobile) {
    return;
  }

  // Filtrar secciones y elementos según rol del usuario
  const filteredNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => userRole && item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-6 dark:bg-background">

      <Sheet>
        <SheetTrigger asChild>
          <Button className="lg:hidden bg-transparent" size="icon" variant="outline">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left">
          <AppSidebarHeader />
          <AppSidebarContent items={filteredNavSections} />
        </SheetContent>
      </Sheet>

      <UserOptions userEmail={session?.email || null} isMobile={true} />
    </header>
  )
}
