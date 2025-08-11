import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "cgm_session"

interface CookieSessionPayload {
    id: string
    email: string
}

export async function getCookieSessionPayload(): Promise<CookieSessionPayload | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    console.log("=== GETTING SESSION COOKIE ===")
    console.log("Cookie name:", SESSION_COOKIE_NAME)
    console.log("Cookie found:", !!sessionCookie)
    console.log("Cookie value:", sessionCookie?.value || "None")

    if (!sessionCookie) {
        console.log("No session cookie found")
        return null
    }

    try {
        const payload: CookieSessionPayload = JSON.parse(sessionCookie.value)
        console.log("Parsed payload:", payload)
        return payload
    } catch (error) {
        console.error("Failed to parse session cookie:", error)
        return null
    }
}

export async function setSessionCookie(id: string, email: string): Promise<void> {
    const cookieStore = await cookies()
    const sessionPayload: CookieSessionPayload = { id, email }
    
    console.log("=== SETTING SESSION COOKIE ===")
    console.log("User ID:", id)
    console.log("Email:", email)
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Session payload:", sessionPayload)
    
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionPayload), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 1 día
        path: "/",
    })
    
    console.log("Cookie set successfully")
}

export async function deleteSessionCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
}
