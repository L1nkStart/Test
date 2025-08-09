import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import { AppSidebar } from "@/components/sidebar/sidebar"
import { MobileHeader } from "@/components//header/mobile-header"
import { SidebarProvider } from "@/components/ui/use-sidebar"
import { getFullUserSession } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TEST Sistema",
  description: "Sistema de gestión para TEST",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getFullUserSession()

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange> */}
        <SidebarProvider>
          <AppSidebar session={session} />
          <div
            className="flex flex-1 flex-col min-h-svh bg-background w-full overflow-x-hidden
                         md:group-[.peer]:data-[state=collapsed]:ml-[var(--sidebar-width-icon)]
                         transition-[margin-left] duration-200 ease-linear"
          >
            <MobileHeader session={session} />

            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-w-0 max-w-full">{children}</main>
          </div>
        </SidebarProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}