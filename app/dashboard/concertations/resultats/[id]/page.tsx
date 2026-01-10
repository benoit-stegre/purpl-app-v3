'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Home } from 'lucide-react'

interface Question {
  id: string
  type: string
  question_text: string
  options?: any
  ordre: number
}

interface Reponse {
  id: string
  reponse_data: any
  created_at: string
}

interface Concertation {
  id: string
  titre: string
  slug: string
}

interface PageProps {
  params: {
    id: string
  }
}

export default function ResultatsDetailPage({ params }: PageProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [concertation, setConcertation] = useState<Concertation | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [reponses, setReponses] = useState<Reponse[]>([])
  const [emails, setEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Charger la concertation
      const { data: concertationData } = await supabase
        .from('concertations')
        .select('*')
        .eq('id', params.id)
        .eq('auteur_id', user.id)
        .single()

      if (!concertationData) {
        router.push('/dashboard/concertations/resultats')
        return
      }

      setConcertation(concertationData)

      // Charger les questions
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('concertation_id', params.id)
        .order('ordre', { ascending: true })

      setQuestions(questionsData || [])

      // Charger les réponses
      const { data: reponsesData } = await supabase
        .from('reponses')
        .select('*')
        .eq('concertation_id', params.id)
        .order('created_at', { ascending: false })

      setReponses(reponsesData || [])

      // Charger les emails
      const { data: emailsData } = await supabase
        .from('emails_collectes')
        .select('email')
        .eq('concertation_id', params.id)

      setEmails(emailsData?.map(e => e.email) || [])

      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const analyzeQuestion = (question: Question) => {
    const responses = reponses
      .map(r => r.reponse_data[question.id])
      .filter(r => r !== null && r !== undefined)

    if (question.type === 'choix_unique') {
      const counts: { [key: string]: number } = {}
      responses.forEach(r => {
        counts[r] = (counts[r] || 0) + 1
      })
      return counts
    }

    if (question.type === 'choix_multiple') {
      const counts: { [key: string]: number } = {}
      responses.forEach(r => {
        if (Array.isArray(r)) {
          r.forEach(choice => {
            counts[choice] = (counts[choice] || 0) + 1
          })
        }
      })
      return counts
    }

    if (question.type === 'echelle') {
      const sum = responses.reduce((acc, r) => acc + (typeof r === 'number' ? r : 0), 0)
      const avg = responses.length > 0 ? (sum / responses.length).toFixed(1) : 0
      return { moyenne: avg, total: responses.length }
    }

    return responses
  }

  const exportCSV = () => {
    if (reponses.length === 0) {
      alert('Aucune réponse à exporter')
      return
    }

    // Construire le CSV
    const headers = ['Date', ...questions.map(q => q.question_text)]
    const rows = reponses.map(r => [
      new Date(r.created_at).toLocaleString('fr-FR'),
      ...questions.map(q => {
        const reponse = r.reponse_data[q.id]
        if (Array.isArray(reponse)) return reponse.join(', ')
        return reponse || ''
      })
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Télécharger
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `resultats-${concertation?.slug || 'export'}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center py-12">Chargement...</div>
      </div>
    )
  }

  if (!concertation) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center py-12">Concertation non trouvée</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Bouton maison en haut à gauche */}
      <Link
        href="/dashboard"
        className="fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Retour au dashboard"
      >
        <Home className="w-6 h-6 text-purple-600" />
      </Link>
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{concertation.titre}</h1>
            <p className="text-gray-600">
              {reponses.length} réponse{reponses.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📊 Exporter CSV
            </button>
            <Link
              href="/dashboard/concertations/resultats"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ← Retour
            </Link>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 mb-1">Total réponses</p>
            <p className="text-3xl font-bold text-blue-600">{reponses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 mb-1">Questions</p>
            <p className="text-3xl font-bold text-green-600">{questions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 mb-1">Emails collectés</p>
            <p className="text-3xl font-bold text-purple-600">{emails.length}</p>
          </div>
        </div>

        {/* Résultats par question */}
        <div className="space-y-6">
          {questions.map((question, index) => {
            const analysis = analyzeQuestion(question)

            return (
              <div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">
                  Question {index + 1} : {question.question_text}
                </h3>

                {(question.type === 'choix_unique' || question.type === 'choix_multiple') && (
                  <div className="space-y-2">
                    {Object.entries(analysis as { [key: string]: number }).map(([choice, count]) => (
                      <div key={choice}>
                        <div className="flex justify-between mb-1">
                          <span>{choice}</span>
                          <span className="font-bold">{count} ({Math.round((count / reponses.length) * 100)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ width: `${(count / reponses.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'echelle' && (
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600 mb-2">
                      {(analysis as any).moyenne}
                    </p>
                    <p className="text-gray-600">
                      Moyenne sur {(analysis as any).total} réponse{(analysis as any).total > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {(question.type === 'texte_court' || question.type === 'texte_long') && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(analysis as string[]).map((reponse, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                        {reponse}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Emails collectés */}
        {emails.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Emails collectés ({emails.length})</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {emails.map((email, idx) => (
                <p key={idx} className="text-sm text-gray-700">{email}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}