// scripts/migrate-logo-data.ts
// Script pour migrer les anciennes données LogoItem vers nouvelle structure

import { migrateLegacyLogoItem } from '@/lib/utils/image-logo'

/**
 * Ce script doit être exécuté UNE SEULE FOIS après déploiement
 * pour convertir les anciennes données LogoItem
 * 
 * ATTENTION : Backup la base de données avant !
 */

async function migrateLogo(legacyLogo: any): Promise<any> {
  // Charger l'image pour obtenir dimensions naturelles
  const img = new Image()
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const newLogo = migrateLegacyLogoItem(
        legacyLogo,
        img.naturalWidth,
        img.naturalHeight
      )
      resolve(newLogo)
    }
    img.onerror = reject
    img.src = legacyLogo.url
  })
}

// À exécuter manuellement pour chaque concertation
export async function migrateAllLogos(designConfig: any) {
  const migratedLogoHeader = await Promise.all(
    designConfig.logoHeader.map(migrateLogo)
  )
  
  const migratedLogosPartenaires = await Promise.all(
    designConfig.logosPartenaires.map(migrateLogo)
  )
  
  return {
    ...designConfig,
    logoHeader: migratedLogoHeader,
    logosPartenaires: migratedLogosPartenaires
  }
}