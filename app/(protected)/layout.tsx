import type React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { getFullUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getFullUserSession();

  console.log("=== PROTECTED LAYOUT DEBUG ===");
  console.log("Sesión en layout protegido:", !!session);
  console.log("Usuario ID:", session?.id || "No encontrado");
  console.log("Email:", session?.email || "No encontrado");

  // Si no hay sesión, redirige a login
  if (!session || !session.id) {
    console.log("Sin sesión válida - redirigiendo a login");
    redirect("/login");
  }

  console.log("Sesión válida - acceso permitido al dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
