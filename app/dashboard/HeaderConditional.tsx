"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/shared/Header"

export function HeaderConditional() {
  const pathname = usePathname()
  
  // Ne pas afficher le Header dans le tunnel de création
  const isInCreationTunnel = pathname?.startsWith("/dashboard/concertations/creer")
  
  if (isInCreationTunnel) {
    return null
  }
  
  return <Header />
}
