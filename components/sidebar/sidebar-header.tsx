"use client"

import Link from "next/link"
import Image from "next/image"

import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebarHeader() {
    return (
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
    )
}