import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('concertations')
    .select('*')
    .eq('auteur_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  const { titre } = body

  const slug = `${titre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`

  const { data, error } = await supabase
    .from('concertations')
    .insert({
      auteur_id: user.id,
      titre,
      slug,
      statut: 'brouillon',
      description: '',
      design_config: {
        canvas: {
          width: 375,
          height: 812,
          background: {
            type: 'couleur',
            couleur: '#FFFFFF'
          }
        },
        elements: []
      }
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
