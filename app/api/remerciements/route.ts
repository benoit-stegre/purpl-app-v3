import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const concertationId = searchParams.get('concertation_id')

    if (!concertationId) {
      return NextResponse.json(
        { error: 'concertation_id requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('remerciements')
      .select('*')
      .eq('concertation_id', concertationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('remerciements')
      .insert({
        concertation_id: body.concertation_id,
        message: body.message || "Merci d'avoir participé à cette concertation !",
        collecte_email_active: body.collecte_email_active || false,
        design_config: body.design_config || {}
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}