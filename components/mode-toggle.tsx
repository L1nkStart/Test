"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar" // Assuming this is where the button component lives

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* The trigger is a SidebarMenuButton for seamless integration */}
                <SidebarMenuButton
                    tooltip="Apariencia"
                    className="w-full"
                >
                    {/* Container for the sun and moon icons */}
                    <div className="relative flex h-[1.2rem] w-[1.2rem] items-center justify-center">
                        <Sun className="h-full w-full scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute inset-0 h-full w-full scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    </div>
                    {/* The text is only visible when the sidebar is expanded */}
                    <span>Apariencia</span>
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            {/* Dropdown menu content */}
            <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={10}
            >
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Oscuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    Sistema
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
