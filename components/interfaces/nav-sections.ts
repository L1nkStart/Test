import { LayoutDashboard, BriefcaseMedical, Building2, DollarSign } from "lucide-react"
import { NavSection } from "@/components/interfaces/nav-interface"

export const navSections: NavSection[] = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        expandable: true,
        items: [
            { title: "Resumen de Titulares", href: "/dashboard/summary", roles: ["Superusuario"] },
            { title: "Titulares de Seguro", href: "/dashboard/insurance-holders", roles: ["Superusuario"] },
        ],
    },
    {
        title: "Casos Médicos",
        icon: BriefcaseMedical,
        expandable: true,
        items: [
            { title: "Listado de casos", href: "/cases-list", roles: ["Superusuario"] },
            { title: "Nuevo Caso", href: "/cases/new", roles: ["Superusuario"] },
            { title: "Mis Casos Asignados", href: "/analyst-dashboard", roles: ["Superusuario"] },
            { title: "Casos Pendientes Auditoría", href: "/auditor-dashboard", roles: ["Superusuario"] },
            { title: "Casos Anulados", href: "/cancelled-cases", roles: ["Superusuario"] },
        ],
    },
    {
        title: "Maestros",
        icon: Building2,
        expandable: true,
        items: [
            { title: "Convenios", href: "/clients", roles: ["Superusuario"] },
            { title: "Pacientes", href: "/patients", roles: ["Superusuario"] },
            { title: "Titulares de Seguro", href: "/insurance-holders", roles: ["Superusuario"] },
            { title: "Compañías de Seguros", href: "/insurance-companies", roles: ["Superusuario"] },
        ],
    },
    {
        title: "Financiero",
        icon: DollarSign,
        expandable: true,
        items: [
            { title: "Facturación", href: "/invoices", roles: ["Superusuario"] },
            { title: "Fondo Incurrido", href: "/incurred-fund", roles: ["Superusuario"] },
            { title: "Pagos", href: "/payments", roles: ["Superusuario"] },
        ],
    },
]