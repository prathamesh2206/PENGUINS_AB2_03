"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[hsl(var(--header-bg))]">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">Clinical Decision Support System</h1>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            <Link href="/" passHref>
              <Button variant={pathname === "/" ? "default" : "outline"} className="neo-shadow">
                Home
              </Button>
            </Link>
            <Link href="/signin" passHref>
              <Button variant={pathname === "/signin" ? "default" : "outline"} className="neo-shadow">
                Sign In
              </Button>
            </Link>
            {pathname === "/patients" || pathname === "/chatbot" ? (
              <Link href="/chatbot" passHref>
                <Button variant={pathname === "/chatbot" ? "default" : "outline"} className="neo-shadow">
                  Chatbot
                </Button>
              </Link>
            ) : null}
          </nav>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="neo-shadow"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

