"use client"

import Link from "next/link"
import { MessageSquare, Megaphone } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
      }
    }
    checkAuth()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#EDEAE3" }}>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="flex gap-8">
          {/* Carte Concertations */}
          <Link href="/dashboard/concertations">
            <div
              className="w-72 h-80 rounded-2xl flex flex-col items-center justify-center gap-6 cursor-pointer transition-all hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: "#FFFEF5", border: "2px solid #EDEAE3" }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#ED693A" }}
              >
                <MessageSquare size={40} className="text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold" style={{ color: "#2F2F2E" }}>
                  Concertations
                </h2>
                <p className="text-sm mt-2 px-4" style={{ color: "#76715A" }}>
                  Créer et gérer vos consultations citoyennes
                </p>
              </div>
            </div>
          </Link>

          {/* Carte Communications */}
          <Link href="/dashboard/communications">
            <div
              className="w-72 h-80 rounded-2xl flex flex-col items-center justify-center gap-6 cursor-pointer transition-all hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: "#FFFEF5", border: "2px solid #EDEAE3" }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#76715A" }}
              >
                <Megaphone size={40} className="text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold" style={{ color: "#2F2F2E" }}>
                  Communications
                </h2>
                <p className="text-sm mt-2 px-4" style={{ color: "#76715A" }}>
                  Diffuser vos messages et actualités
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
