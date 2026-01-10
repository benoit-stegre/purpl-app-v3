import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function ConcertationAccueilPage({ params }: PageProps) {
  const supabase = createClient()

  // Récupérer la concertation publiée
  const { data: concertation, error } = await supabase
    .from('concertations')
    .select('*')
    .eq('slug', params.slug)
    .eq('statut', 'publie')
    .single()

  if (error || !concertation) {
    notFound()
  }

  // Récupérer le nombre de questions
  const { count: questionCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('concertation_id', concertation.id)

  const designConfig = concertation.design_config || {}

  return (
    <div className="max-w-2xl mx-auto">
      <div 
        className="bg-white rounded-lg shadow-lg p-8"
        style={{
          backgroundColor: designConfig.backgroundColor || '#ffffff',
          color: designConfig.textColor || '#000000',
        }}
      >
        <h1 
          className="text-3xl font-bold mb-4"
          style={{
            fontFamily: designConfig.fontFamily || 'inherit',
          }}
        >
          {concertation.titre}
        </h1>

        {concertation.description && (
          <p className="text-lg mb-6 whitespace-pre-wrap">
            {concertation.description}
          </p>
        )}

        <div className="mb-6">
          <p className="text-sm opacity-75">
            {questionCount} question{questionCount > 1 ? 's' : ''} • Environ {Math.ceil((questionCount || 0) * 0.5)} min
          </p>
        </div>

        <Link
          href={`/c/${params.slug}/q/0`}
          className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: designConfig.primaryColor || '#3b82f6',
            color: '#ffffff',
          }}
        >
          Commencer
        </Link>
      </div>
    </div>
  )
}