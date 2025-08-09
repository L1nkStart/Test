interface NavItem {
    title: string
    href: string
    roles: string[]
}

export interface NavSection {
    title: string
    items: NavItem[]
    icon: React.ElementType
    expandable?: boolean
    isActive?: boolean
}