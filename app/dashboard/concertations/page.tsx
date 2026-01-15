'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Edit2, BarChart3 } from 'lucide-react'
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
      case 'brouillon': 
        return { bg: '#F3F4F6', text: '#4B5563' }
      case 'publiee': 
        return { bg: '#D1FAE5', text: '#065F46' }
      case 'terminee': 
        return { bg: '#FEE2E2', text: '#991B1B' }
      default: 
        return { bg: '#F3F4F6', text: '#4B5563' }
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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#EDEAE3' }}
      >
        <div style={{ color: '#2F2F2E' }}>Chargement...</div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#EDEAE3' }}
    >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: '#2F2F2E' }}
          >
            Mes concertations
          </h1>
          <button
            onClick={createConcertation}
            disabled={creating}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#ED693A' }}
          >
            {creating ? 'Création...' : '+ Nouvelle concertation'}
          </button>
        </div>

        {/* Content */}
        {concertations.length === 0 ? (
          <div 
            className="rounded-2xl p-12 text-center"
            style={{ 
              backgroundColor: '#FFFEF5', 
              border: '2px solid #EDEAE3' 
            }}
          >
            <p 
              className="mb-6 text-base sm:text-lg"
              style={{ color: '#76715A' }}
            >
              Vous n'avez pas encore de concertation.
            </p>
            <button
              onClick={createConcertation}
              disabled={creating}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ED693A' }}
            >
              {creating ? 'Création...' : 'Créer ma première concertation'}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {concertations.map((concertation) => {
              const statusColors = getStatusColor(concertation.statut)
              return (
                <div
                  key={concertation.id}
                  className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-all hover:shadow-lg"
                  style={{ 
                    backgroundColor: '#FFFEF5', 
                    border: '2px solid #EDEAE3' 
                  }}
                >
                  <div className="flex-1 w-full">
                    <h3 
                      className="text-lg sm:text-xl font-bold mb-3 break-words"
                      style={{ color: '#2F2F2E' }}
                    >
                      {concertation.titre}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <span
                        className="px-3 py-1.5 rounded-full text-xs font-semibold inline-block w-fit"
                        style={{ 
                          backgroundColor: statusColors.bg, 
                          color: statusColors.text 
                        }}
                      >
                        {getStatusLabel(concertation.statut)}
                      </span>
                      <span 
                        className="text-sm"
                        style={{ color: '#76715A' }}
                      >
                        Créée le {new Date(concertation.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => router.push(`/dashboard/concertations/creer/accueil?id=${concertation.id}`)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all hover:shadow-md whitespace-nowrap"
                      style={{ backgroundColor: '#76715A' }}
                    >
                      <Edit2 className="w-4 h-4" />
                      Éditer
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/concertations/resultats/${concertation.id}`)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all hover:shadow-md whitespace-nowrap"
                      style={{ backgroundColor: '#ED693A' }}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Résultats
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(concertation.id, e)}
                      className="p-2.5 rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: 'transparent',
                        color: '#C23C3C'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEE2E2'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      aria-label="Supprimer la concertation"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )
            })}
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
