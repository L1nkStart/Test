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

  // Si no hay sesión, redirige a login
  if (!session || !session.id) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
