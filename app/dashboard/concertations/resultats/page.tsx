'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Concertation {
  id: string
  titre: string
  slug: string
  statut: string
  created_at: string
  reponse_count?: number
}

export default function ResultatsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [concertations, setConcertations] = useState<Concertation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConcertations()
  }, [])

  const loadConcertations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Récupérer les concertations publiées de l'utilisateur
      const { data: concertationsData } = await supabase
        .from('concertations')
        .select('*')
        .eq('auteur_id', user.id)
        .eq('statut', 'publie')
        .order('created_at', { ascending: false })

      if (concertationsData) {
        // Compter les réponses pour chaque concertation
        const concertationsWithCounts = await Promise.all(
          concertationsData.map(async (c) => {
            const { count } = await supabase
              .from('reponses')
              .select('*', { count: 'exact', head: true })
              .eq('concertation_id', c.id)

            return {
              ...c,
              reponse_count: count || 0
            }
          })
        )

        setConcertations(concertationsWithCounts)
      }

      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center py-12">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Résultats des concertations</h1>
          <Link
            href="/dashboard/concertations"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Retour
          </Link>
        </div>

        {concertations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Aucune concertation publiée</p>
            <Link
              href="/dashboard/concertations"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voir mes concertations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concertations.map((concertation) => (
              <Link
                key={concertation.id}
                href={`/dashboard/concertations/resultats/${concertation.id}`}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold mb-2">{concertation.titre}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <strong>Réponses :</strong>{' '}
                    <span className="text-blue-600 font-bold text-lg">
                      {concertation.reponse_count}
                    </span>
                  </p>
                  <p>
                    <strong>URL :</strong> /c/{concertation.slug}
                  </p>
                  <p>
                    <strong>Créée le :</strong>{' '}
                    {new Date(concertation.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Voir les résultats →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}