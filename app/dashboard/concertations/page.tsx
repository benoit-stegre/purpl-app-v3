'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/shared/ConfirmModal'

interface Concertation {
  id: string
  titre: string
  slug: string
  statut: string
  created_at: string
  updated_at: string
}

export default function ConcertationsPage() {
  const [concertations, setConcertations] = useState<Concertation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [concertationToDelete, setConcertationToDelete] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadConcertations()
  }, [])

  async function loadConcertations() {
    const response = await fetch('/api/concertations')
    if (response.ok) {
      const data = await response.json()
      setConcertations(data)
    }
    setLoading(false)
  }

  async function createConcertation() {
    setCreating(true)

    const response = await fetch('/api/concertations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre: 'Nouvelle concertation' })
    })

    if (response.ok) {
      const data = await response.json()
      router.push(`/dashboard/concertations/creer/accueil?id=${data.id}`)
    } else {
      alert('Erreur lors de la création')
      setCreating(false)
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'bg-gray-200 text-black'
      case 'publiee': return 'bg-green-200 text-black'
      case 'terminee': return 'bg-red-200 text-black'
      default: return 'bg-gray-200 text-black'
    }
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'Brouillon'
      case 'publiee': return 'Publiée'
      case 'terminee': return 'Terminée'
      default: return statut
    }
  }

  const handleDeleteClick = (concertationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConcertationToDelete(concertationId)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!concertationToDelete) return

    try {
      const response = await fetch(`/api/concertations/${concertationToDelete}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setConcertations(concertations.filter(c => c.id !== concertationToDelete))
      } else {
        console.error('Erreur suppression:', data)
        alert(`Erreur lors de la suppression: ${data.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }

    setDeleteModalOpen(false)
    setConcertationToDelete(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-black">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-600">Mes concertations</h1>
          <button
            onClick={createConcertation}
            disabled={creating}
            className="w-full sm:w-auto bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base"
          >
            {creating ? 'Création...' : '+ Nouvelle concertation'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {concertations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <p className="text-black mb-6 text-sm sm:text-base">
              Vous n'avez pas encore de concertation.
            </p>
            <button
              onClick={createConcertation}
              disabled={creating}
              className="bg-purple-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base"
            >
              {creating ? 'Création...' : 'Créer ma première concertation'}
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {concertations.map((concertation) => (
              <div
                key={concertation.id}
                className="bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-black break-words">
                    {concertation.titre}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-black">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium inline-block w-fit ${getStatusColor(concertation.statut)}`}
                    >
                      {getStatusLabel(concertation.statut)}
                    </span>
                    <span className="text-xs sm:text-sm">
                      Créée le {new Date(concertation.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => router.push(`/dashboard/concertations/creer/accueil?id=${concertation.id}`)}
                    className="flex-1 sm:flex-none bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-semibold hover:bg-purple-700 text-sm sm:text-base whitespace-nowrap"
                  >
                    Continuer
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(concertation.id, e)}
                    className="p-2 bg-transparent rounded hover:bg-red-50 transition-colors"
                    aria-label="Supprimer la concertation"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setConcertationToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer la concertation"
        message="Êtes-vous sûr de vouloir supprimer cette concertation ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />
    </div>
  )
}
