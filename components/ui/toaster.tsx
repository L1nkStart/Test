"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, XCircle, AlertCircle, Info, ShieldX } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (variant: string | undefined, title: string | undefined) => {
    if (variant === "destructive") {
      // Usar icono específico para errores de autenticación
      if (title === "Acceso denegado") {
        return <ShieldX className="h-5 w-5 text-destructive flex-shrink-0" />
      }
      return <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
    }
    
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5" style={{ color: "hsl(var(--status-active))" }} />
      default:
        return <Info className="h-5 w-5 text-primary flex-shrink-0" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 w-full">
              {getToastIcon(variant, title)}
              <div className="flex-1 grid gap-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
