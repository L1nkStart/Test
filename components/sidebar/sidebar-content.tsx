"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from 'lucide-react'

import {
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { NavSection } from "@/components/interfaces/nav-interface"

export function AppSidebarContent({
    items,
}: {
    items: NavSection[]
}) {
    const pathname = usePathname()
    const { state, setOpen } = useSidebar()
    const isCollapsed = state === "collapsed"

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

    // Inicializar el estado expandido basado en la sección activa
    useEffect(() => {
        const initialExpanded: Record<string, boolean> = {}
        items.forEach((section) => {
            // Expandir si es la sección activa o si alguno de sus items está activo
            const hasActiveItem = section.items.some(item =>
                pathname === item.href || pathname.startsWith(item.href)
            )
            initialExpanded[section.title] = section.isActive || hasActiveItem
        })
        setExpandedSections(initialExpanded)
    }, [items, pathname])

    const toggleSection = (title: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [title]: !prev[title],
        }))
    }

    // Función para manejar el click en el trigger cuando está colapsado
    const handleCollapsedClick = (sectionTitle: string) => {
        if (isCollapsed) {
            // Expandir el sidebar
            setOpen(true)
            // Expandir la sección clickeada
            setExpandedSections((prev) => ({
                ...prev,
                [sectionTitle]: true,
            }))
        } else {
            // Comportamiento normal cuando no está colapsado
            toggleSection(sectionTitle)
        }
    }

    return (
        <SidebarContent>
            <SidebarGroup>
                <SidebarMenu>
                    {items.map((section) => {
                        const isExpanded = expandedSections[section.title] || false

                        return (
                            <Collapsible
                                key={section.title}
                                open={isExpanded}
                                onOpenChange={(open) => {
                                    if (!isCollapsed) {
                                        setExpandedSections((prev) => ({
                                            ...prev,
                                            [section.title]: open,
                                        }))
                                    }
                                }}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={section.title}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handleCollapsedClick(section.title)
                                            }}
                                            className="w-full"
                                        >
                                            {section.icon && <section.icon />}
                                            <span>{section.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {section.items.map((item) => (
                                                <SidebarMenuSubItem key={item.href}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={pathname === item.href || pathname.startsWith(item.href)}
                                                    >
                                                        <Link href={item.href}>
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
    )
}
