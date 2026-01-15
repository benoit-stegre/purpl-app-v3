"use client"

import Link from "next/link"
import { Home, MessageSquare, Megaphone, User, ChevronDown, LogOut, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/concertations", label: "Concertation", icon: MessageSquare },
  { href: "/dashboard/communications", label: "Communication", icon: Megaphone },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-user-menu]')) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6"
      style={{
        backgroundColor: "#76715A",
        height: "75px",
      }}
    >
      {/* Logo - Left */}
      <Link href="/dashboard" className="flex-shrink-0">
        <img 
          src="/logo-purpl.png" 
          alt="PURPL" 
          className="h-[60px] w-auto"
        />
      </Link>

      {/* Navigation - Center */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: isActive ? "#ED693A" : "rgba(255, 255, 255, 0.8)",
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Menu - Right */}
      <div className="relative" data-user-menu>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
        >
          <User className="w-6 h-6" />
          <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[#FFFEF5] rounded-lg shadow-lg border border-[#EDEAE3] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#EDEAE3]">
              <p className="text-sm text-[#76715A] font-medium truncate">
                {userEmail || "Utilisateur"}
              </p>
            </div>
            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#EDEAE3] transition-colors flex items-center gap-2 text-[#2F2F2E]">
              <User className="w-4 h-4" />
              Mon profil
            </button>
            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#EDEAE3] transition-colors flex items-center gap-2 text-[#2F2F2E]">
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
            <div className="border-t border-[#EDEAE3]" />
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#EDEAE3] transition-colors flex items-center gap-2 text-[#C23C3C]"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
