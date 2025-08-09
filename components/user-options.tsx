"use client"

import { User, LogOut, CircleUser, Settings, Wrench, ChevronsUpDown } from 'lucide-react'

import {
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
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

import { Button } from "@/components/ui/button"

import { logoutAction } from "@/app/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppSidebarFooterProps {
    userEmail: string | null
    isMobile: boolean | null
}

// Obtener iniciales del usuario
const getUserInitials = (email: string | null) => {
    if (!email) return "U"
    return email.charAt(0).toUpperCase()
}

/*
    Decidí dejarle los wrappers de Sidebar ya que inicialmente lo pensé únicamente como footer del sidebar.
    Pero perfectamente se podía usar también en el header de mobile sin generar errores funcionales o de estilo.

    Aunque lo ideal en un proyecto real creo que si sería crear un componente separado o quitar los wrappers condicionalmente.
*/

export function UserOptions({ userEmail, isMobile }: AppSidebarFooterProps) {
    return (
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            {isMobile ? (
                                <Button className="overflow-hidden rounded-full bg-transparent" size="icon" variant="outline">
                                    <Avatar>
                                        <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                                        <AvatarFallback>{userEmail ? userEmail.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            ) : (
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <User className="h-4 w-4" />
                                    <span>{userEmail || "Usuario"}</span>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            )}

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
                                    <CircleUser />
                                    Mi Perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings />
                                    Configuración
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Wrench />
                                    Soporte
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
    );
}