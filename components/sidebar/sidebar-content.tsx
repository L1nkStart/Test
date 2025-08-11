"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

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
import { ModeToggle } from "@/components/mode-toggle"

export function AppSidebarContent({
    items,
}: {
    items: NavSection[]
}) {
    const pathname = usePathname()
    const { state, setOpen } = useSidebar()
    const isCollapsed = state === "collapsed"

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const initialExpanded: Record<string, boolean> = {}
        items.forEach((section) => {
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

    const handleCollapsedClick = (sectionTitle: string) => {
        if (isCollapsed) {
            setOpen(true)
            setExpandedSections((prev) => ({
                ...prev,
                [sectionTitle]: true,
            }))
        } else {
            toggleSection(sectionTitle)
        }
    }

    return (
        <SidebarContent className="flex flex-col h-full">
            <SidebarGroup className="flex-grow">
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

            <SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <ModeToggle />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
    )
}
