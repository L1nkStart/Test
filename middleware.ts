import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCookieSessionPayload } from "@/lib/session-utils"

export async function middleware(request: NextRequest) {
  const sessionPayload = await getCookieSessionPayload()
  const { pathname } = request.nextUrl

  console.log("=== MIDDLEWARE DEBUG ===")
  console.log("Ruta solicitada:", pathname)
  console.log("Sesión encontrada:", !!sessionPayload)
  console.log("ID de usuario:", sessionPayload?.id || "No encontrado")

  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/login", "/api/auth/login"]

  // Si la ruta es pública, permite el acceso
  if (publicPaths.includes(pathname)) {
    console.log("Ruta pública - acceso permitido")
    return NextResponse.next()
  }

  // Rutas protegidas que requieren autenticación
  const protectedPaths = ["/dashboard", "/users", "/cases", "/invoices", "/payments", "/baremos"]
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path))

  // Si no hay sesión y es una ruta protegida, redirige a login
  if (!sessionPayload && (isProtectedRoute || pathname.startsWith("/dashboard"))) {
    console.log("Acceso denegado - sin sesión, redirigiendo a login")
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Si no hay sesión para cualquier ruta no pública, redirige a login
  if (!sessionPayload) {
    console.log("Acceso denegado - sin sesión para ruta no pública")
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  console.log("Acceso permitido - sesión válida")
  // Si hay sesión, permite el acceso a rutas protegidas
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
