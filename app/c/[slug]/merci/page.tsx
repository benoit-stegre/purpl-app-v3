'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Concertation {
  id: string
  titre: string
  design_config: any
}

interface Remerciement {
  message: string
  image_url?: string
  collecte_email_active: boolean
  design_config: any
}

interface PageProps {
  params: {
    slug: string
  }
}

export default function MerciPage({ params }: PageProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [concertation, setConcertation] = useState<Concertation | null>(null)
  const [remerciement, setRemerciement] = useState<Remerciement | null>(null)
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [params.slug])

  const loadData = async () => {
    try {
      // Charger la concertation
      const { data: concertData } = await supabase
        .from('concertations')
        .select('*')
        .eq('slug', params.slug)
        .eq('statut', 'publie')
        .single()

      if (!concertData) {
        router.push('/404')
        return
      }

      setConcertation(concertData)

      // Charger le remerciement
      const { data: remerciementData } = await supabase
        .from('remerciements')
        .select('*')
        .eq('concertation_id', concertData.id)
        .single()

      setRemerciement(remerciementData)
      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !concertation) return

    try {
      await supabase.from('emails_collectes').insert({
        concertation_id: concertation.id,
        email: email
      })

      setEmailSubmitted(true)
    } catch (error) {
      console.error('Erreur envoi email:', error)
      alert('Erreur lors de l\'enregistrement de votre email')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  if (!concertation) {
    return <div className="text-center py-12">Concertation non trouvée</div>
  }

  const designConfig = {
    ...(concertation.design_config || {}),
    ...(remerciement?.design_config || {})
  }

  const defaultMessage = "Merci d'avoir participé à cette concertation ! Votre avis compte."

  return (
    <div className="max-w-2xl mx-auto">
      <div 
        className="bg-white rounded-lg shadow-lg p-8 text-center"
        style={{
          backgroundColor: designConfig.backgroundColor || '#ffffff',
          color: designConfig.textColor || '#000000',
        }}
      >
        {/* Image si présente */}
        {remerciement?.image_url && (
          <img 
            src={remerciement.image_url} 
            alt="Remerciement"
            className="w-full max-h-64 object-cover rounded-lg mb-6"
          />
        )}

        {/* Message de remerciement */}
        <h1 
          className="text-3xl font-bold mb-6"
          style={{
            fontFamily: designConfig.fontFamily || 'inherit',
          }}
        >
          Merci !
        </h1>

        <p className="text-lg mb-8 whitespace-pre-wrap">
          {remerciement?.message || defaultMessage}
        </p>

        {/* Collecte d'email si activée */}
        {remerciement?.collecte_email_active && !emailSubmitted && (
          <div className="max-w-md mx-auto mb-8">
            <p className="text-sm mb-4">
              Souhaitez-vous recevoir les résultats de cette concertation ?
            </p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: designConfig.primaryColor || '#3b82f6'
                }}
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: designConfig.primaryColor || '#3b82f6',
                  color: '#ffffff'
                }}
              >
                Envoyer
              </button>
            </form>
          </div>
        )}

        {emailSubmitted && (
          <p className="text-green-600 mb-8">
            ✅ Email enregistré avec succès !
          </p>
        )}

        {/* Bouton retour à l'accueil */}
        <button
          onClick={() => router.push(`/c/${params.slug}`)}
          className="inline-block px-6 py-3 rounded-lg border-2 font-medium transition-colors"
          style={{
            borderColor: designConfig.primaryColor || '#3b82f6',
            color: designConfig.primaryColor || '#3b82f6'
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}