'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TunnelNavigation from '@/components/tunnel/TunnelNavigation'
import ConfirmModal from '@/components/shared/ConfirmModal'

interface Concertation {
  id: string
  titre: string
  description: string
  slug: string
  statut: string
}

export default function ExportPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [concertation, setConcertation] = useState<Concertation | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)

  useEffect(() => {
    loadConcertation()
  }, [])

  const loadConcertation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Récupérer la concertation en brouillon
      const { data: concertations } = await supabase
        .from('concertations')
        .select('*')
        .eq('auteur_id', user.id)
        .eq('statut', 'brouillon')
        .order('created_at', { ascending: false })
        .limit(1)

      if (concertations && concertations.length > 0) {
        setConcertation(concertations[0])

        // Compter les questions
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('concertation_id', concertations[0].id)

        setQuestionCount(count || 0)
      }

      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const handlePublishClick = () => {
    if (!concertation) return

    if (questionCount === 0) {
      alert('Vous devez ajouter au moins une question avant de publier')
      return
    }

    setPublishModalOpen(true)
  }

  const handlePublish = async () => {
    if (!concertation) return

    setPublishing(true)

    try {
      const { error } = await supabase
        .from('concertations')
        .update({ statut: 'publie' })
        .eq('id', concertation.id)

      if (error) throw error

      alert('Concertation publiée avec succès !')
      router.push('/dashboard/concertations')
    } catch (error) {
      console.error('Erreur publication:', error)
      alert('Erreur lors de la publication')
      setPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    alert('Brouillon sauvegardé automatiquement')
    router.push('/dashboard/concertations')
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  if (!concertation) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Aucune concertation en cours</p>
        <button
          onClick={() => router.push('/dashboard/concertations/creer/accueil')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Créer une concertation
        </button>
      </div>
    )
  }

  const publicUrl = `${window.location.origin}/c/${concertation.slug}`

  return (
    <div className="min-h-screen bg-gray-50">
      <TunnelNavigation currentStep="export" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Publier votre concertation</h1>

          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {/* Résumé */}
            <div>
              <h2 className="text-xl font-bold mb-4">Résumé</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Titre :</strong> {concertation.titre}</p>
                <p><strong>Description :</strong> {concertation.description || 'Aucune description'}</p>
                <p><strong>Nombre de questions :</strong> {questionCount}</p>
                <p><strong>Statut :</strong> <span className="text-orange-600 font-medium">{concertation.statut}</span></p>
              </div>
            </div>

            {/* URL publique */}
            <div>
              <h3 className="text-lg font-bold mb-2">URL publique</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl)
                    alert('URL copiée !')
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  📋 Copier
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Cette URL sera active une fois la concertation publiée
              </p>
            </div>

            {/* Avertissement si pas de questions */}
            {questionCount === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">
                  ⚠️ Vous devez ajouter au moins une question avant de publier
                </p>
              </div>
            )}

            {/* Checklist */}
            <div>
              <h3 className="text-lg font-bold mb-3">Checklist avant publication</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={!!concertation.titre} disabled className="w-4 h-4" />
                  <span>Titre défini</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={questionCount > 0} disabled className="w-4 h-4" />
                  <span>Au moins une question ajoutée</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={!!concertation.slug} disabled className="w-4 h-4" />
                  <span>URL personnalisée définie</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSaveDraft}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                💾 Sauvegarder le brouillon
              </button>
              <button
                onClick={handlePublishClick}
                disabled={questionCount === 0 || publishing}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {publishing ? '⏳ Publication...' : '🚀 Publier'}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => router.push('/dashboard/concertations/creer/affiche')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Précédent
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={() => {
          handlePublish()
          setPublishModalOpen(false)
        }}
        title="Publier la concertation"
        message="Êtes-vous sûr de vouloir publier cette concertation ? Elle sera accessible publiquement."
        confirmText="Publier"
        cancelText="Annuler"
        confirmButtonColor="blue"
      />
    </div>
  )
}