import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_BUTTON_CONFIG } from '@/types/design-v6'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer toutes les concertations
    const { data: concertations, error: fetchError } = await supabase
      .from('concertations')
      .select('id, design_config')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!concertations) {
      return NextResponse.json({ message: 'Aucune concertation trouvée' })
    }

    let updatedCount = 0
    const errors: string[] = []

    // Parcourir toutes les concertations
    for (const concertation of concertations) {
      try {
        const designConfig = concertation.design_config || {}
        
        // Vérifier si le bouton existe et si son texte est vide
        if (!designConfig.bouton || !designConfig.bouton.text || designConfig.bouton.text.trim() === '') {
          // Réinitialiser le bouton avec la configuration par défaut
          const updatedConfig = {
            ...designConfig,
            bouton: {
              ...DEFAULT_BUTTON_CONFIG,
              // Préserver les autres propriétés du bouton si elles existent
              ...(designConfig.bouton || {}),
              text: DEFAULT_BUTTON_CONFIG.text
            }
          }

          // Mettre à jour la concertation
          const { error: updateError } = await supabase
            .from('concertations')
            .update({ design_config: updatedConfig })
            .eq('id', concertation.id)

          if (updateError) {
            errors.push(`Erreur pour ${concertation.id}: ${updateError.message}`)
          } else {
            updatedCount++
          }
        }
      } catch (error: any) {
        errors.push(`Erreur pour ${concertation.id}: ${error.message}`)
      }
    }

    return NextResponse.json({
      message: `${updatedCount} concertation(s) mise(s) à jour`,
      updatedCount,
      total: concertations.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


