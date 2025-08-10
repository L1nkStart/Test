import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
        case "activo":
            return "bg-green-100 text-green-800 border-green-200"
        case "suspendido":
            return "bg-yellow-100 text-yellow-800 border-yellow-200"
        case "vencido":
            return "bg-orange-100 text-orange-800 border-orange-200"
        case "cancelado":
            return "bg-red-100 text-red-800 border-red-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}

export const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return "N/A"
    return new Intl.NumberFormat("es-VE", {
        style: "currency",
        currency: "USD",
    }).format(amount)
}