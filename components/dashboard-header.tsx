import { Button } from "@/components/ui/button"
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu"
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  HomeIcon,
  LineChartIcon,
  Package2Icon,
  SearchIcon,
  UsersIcon,
  MenuIcon,
  DollarSignIcon,
  FileTextIcon,
  WalletIcon,
  ClipboardListIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { getFullUserSession, hasRequiredRole } from "@/lib/auth" // Importa getFullUserSession
import { logoutAction } from "@/app/actions" // Importa la Server Action de logout
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function DashboardHeader() {
  const session = await getFullUserSession() // Obtiene la sesión completa del usuario
  const userRole = session?.role || "Invitado"

  const navItems = [
    {
      href: "/dashboard/titulares",
      label: "Dashboard",
      icon: HomeIcon,
      roles: ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor", "Jefe Financiero"],
    },
    { href: "/users", label: "Usuarios", icon: UsersIcon, roles: ["Superusuario"] },
    {
      href: "/cases",
      label: "Casos",
      icon: ClipboardListIcon,
      roles: ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor"],
    },
    { href: "/cases/new", label: "Nuevo Caso", icon: XIcon, roles: ["Superusuario", "Coordinador Regional"] },
    { href: "/analyst-dashboard", label: "Dashboard Analista", icon: LineChartIcon, roles: ["Analista Concertado"] },
    { href: "/auditor-dashboard", label: "Dashboard Auditor", icon: LineChartIcon, roles: ["Médico Auditor"] },
    {
      href: "/cancelled-cases",
      label: "Casos Anulados",
      icon: XIcon,
      roles: ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor", "Jefe Financiero"],
    },
    { href: "/invoices", label: "Facturas", icon: FileTextIcon, roles: ["Superusuario", "Jefe Financiero"] },
    { href: "/incurred-fund", label: "Fondo Incurrido", icon: WalletIcon, roles: ["Superusuario", "Jefe Financiero"] },
    { href: "/payments", label: "Pagos", icon: DollarSignIcon, roles: ["Superusuario", "Jefe Financiero"] },
    { href: "/baremos", label: "Baremos", icon: ClipboardListIcon, roles: ["Superusuario", "Coordinador Regional"] },
  ]

  const filteredNavItems = navItems.filter((item) => hasRequiredRole(userRole, item.roles))

  return (
    <header className="flex h-14 sm:h-16 lg:h-[60px] items-center gap-2 sm:gap-4 border-b bg-gray-100/40 px-3 sm:px-4 lg:px-6 dark:bg-gray-800/40">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="lg:hidden bg-transparent" size="icon" variant="outline">
            <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[300px]">
          <Link className="flex items-center gap-2 font-semibold text-sm sm:text-base" href="#">
            <Package2Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="truncate">TEST System</span>
          </Link>
          <div className="grid gap-2 py-4 sm:py-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                className="flex w-full items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 text-sm text-gray-900 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href={item.href}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex-1 min-w-0">
        <form className="hidden sm:block">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              className="w-full bg-white shadow-none appearance-none pl-8 text-sm dark:bg-gray-950"
              placeholder="Buscar..."
              type="search"
            />
          </div>
        </form>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="overflow-hidden rounded-full bg-transparent h-8 w-8 sm:h-10 sm:w-10" size="icon" variant="outline">
            <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
              <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
              <AvatarFallback className="text-xs sm:text-sm">
                {session?.email ? session.email.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 sm:w-56">
          <DropdownMenuLabel className="truncate text-sm">
            {session?.email || "Mi Cuenta"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-sm">Configuración</DropdownMenuItem>
          <DropdownMenuItem className="text-sm">Soporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-sm">
            <form action={logoutAction} className="w-full">
              <button type="submit" className="w-full text-left">
                Cerrar Sesión
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
