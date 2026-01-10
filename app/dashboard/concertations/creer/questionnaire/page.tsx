'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuestionnaireStore } from '@/stores/questionnaireStore'
import QuestionsList from '@/components/questionnaire/QuestionsList'
import QuestionEditor from '@/components/questionnaire/QuestionEditor'
import QuestionPreview from '@/components/questionnaire/QuestionPreview'

function QuestionnaireContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const concertationId = searchParams.get('id')
  const [loading, setLoading] = useState(true)
  const [titre, setTitre] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const { setQuestions, setConcertationId } = useQuestionnaireStore()

  useEffect(() => {
    if (!concertationId) {
      router.push('/dashboard/concertations')
      return
    }
    loadData()
  }, [concertationId])

  async function loadData() {
    try {
      const concertationRes = await fetch(`/api/concertations/${concertationId}`)
      const concertation = await concertationRes.json()
      setTitre(concertation.titre)

      const questionsRes = await fetch(
        `/api/questions?concertation_id=${concertationId}`
      )
      const questions = await questionsRes.json()

      setConcertationId(concertationId!)
      setQuestions(questions)
      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-black text-lg">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header fixe */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => router.push(`/dashboard/concertations/creer/accueil?id=${concertationId}`)}
            className="text-black hover:text-purple-600 font-medium text-sm sm:text-base"
          >
            ← Retour
          </button>
          <h1 className="text-base sm:text-xl font-bold text-black truncate">
            Questionnaire : {titre}
          </h1>
          {saveStatus === 'saving' && (
            <span className="text-xs sm:text-sm text-gray-500">Sauvegarde...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs sm:text-sm text-green-600">✓ Sauvegardé</span>
          )}
        </div>
        <button
          onClick={() =>
            router.push(
              `/dashboard/concertations/creer/remerciement?id=${concertationId}`
            )
          }
          className="w-full sm:w-auto bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg hover:bg-purple-700 font-medium text-sm sm:text-base"
        >
          Étape suivante →
        </button>
      </div>

      {/* Layout 3 colonnes → 1 colonne sur mobile, scrollable */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="w-full lg:w-auto lg:flex-1 lg:flex lg:overflow-hidden">
          <QuestionsList setSaveStatus={setSaveStatus} />
          <QuestionPreview />
          <QuestionEditor setSaveStatus={setSaveStatus} />
        </div>
      </div>
    </div>
  )
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-black text-lg">Chargement...</div></div>}>
      <QuestionnaireContent />
    </Suspense>
  )
}