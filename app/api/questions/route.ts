import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const concertationId = searchParams.get('concertation_id')

  if (!concertationId) {
    return NextResponse.json(
      { error: 'concertation_id requis' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('concertation_id', concertationId)
    .order('ordre', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(questions)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { concertation_id } = body

  const { data: concertation, error: concertationError } = await supabase
    .from('concertations')
    .select('auteur_id, modifiable')
    .eq('id', concertation_id)
    .single()

  if (concertationError || !concertation) {
    return NextResponse.json(
      { error: 'Concertation non trouvée' },
      { status: 404 }
    )
  }

  if (concertation.auteur_id !== user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  if (!concertation.modifiable) {
    return NextResponse.json(
      { error: 'Concertation verrouillée' },
      { status: 403 }
    )
  }

  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('ordre')
    .eq('concertation_id', concertation_id)
    .order('ordre', { ascending: false })
    .limit(1)

  const nextOrdre = existingQuestions && existingQuestions.length > 0 
    ? existingQuestions[0].ordre + 1 
    : 1

  const newQuestion = {
    concertation_id,
    ordre: nextOrdre,
    type: body.type || 'texte_libre',
    question_text: body.question_text || 'Nouvelle question',
    obligatoire: body.obligatoire ?? false,
    options: body.options || null,
    photo_autorisee: body.photo_autorisee ?? true,
    image_url: body.image_url || null
  }

  const { data: question, error } = await supabase
    .from('questions')
    .insert(newQuestion)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(question)
}