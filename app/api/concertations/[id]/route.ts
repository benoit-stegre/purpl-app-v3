import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== API GET /api/concertations/[id] ===')
    console.log('ID reçu:', params.id)

    const supabase = await createClient()
    
    console.log('Client Supabase créé')

    const { data, error } = await supabase
      .from('concertations')
      .select('*')
      .eq('id', params.id)
      .single()

    console.log('Résultat query:', { data, error })

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.log('Aucune concertation trouvée')
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    console.log('Concertation trouvée:', data.titre)
    return NextResponse.json(data)

  } catch (err) {
    console.error('=== ERREUR CATCH ===')
    console.error('Type:', err instanceof Error ? err.constructor.name : typeof err)
    console.error('Message:', err instanceof Error ? err.message : String(err))
    console.error('Stack:', err instanceof Error ? err.stack : 'No stack')
    
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== API PATCH /api/concertations/[id] ===')
    console.log('ID reçu:', params.id)

    const supabase = await createClient()
    const body = await request.json()

    console.log('Body reçu:', Object.keys(body))

    const { data, error } = await supabase
      .from('concertations')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    console.log('Résultat update:', { data, error })

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Concertation mise à jour')
    return NextResponse.json(data)

  } catch (err) {
    console.error('=== ERREUR CATCH PATCH ===')
    console.error('Message:', err instanceof Error ? err.message : String(err))
    
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que la concertation existe et appartient à l'utilisateur
    const { data: concertation, error: fetchError } = await supabase
      .from('concertations')
      .select('id, auteur_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !concertation) {
      return NextResponse.json({ error: 'Concertation non trouvée' }, { status: 404 })
    }

    if (concertation.auteur_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Supprimer la concertation
    const { error, data } = await supabase
      .from('concertations')
      .delete()
      .eq('id', params.id)
      .eq('auteur_id', user.id)
      .select()

    if (error) {
      console.error('Erreur Supabase DELETE:', error)
      return NextResponse.json({ 
        error: error.message || 'Erreur lors de la suppression',
        details: error 
      }, { status: 500 })
    }

    // Vérifier si une ligne a été supprimée
    if (!data || data.length === 0) {
      console.error('Aucune ligne supprimée - possible problème RLS')
      return NextResponse.json({ 
        error: 'Aucune ligne supprimée. Vérifiez les policies RLS.' 
      }, { status: 403 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}