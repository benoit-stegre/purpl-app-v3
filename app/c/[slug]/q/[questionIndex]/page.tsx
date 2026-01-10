'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

interface Question {
  id: string
  type: string
  question_text: string
  options?: any
  image_url?: string
  ordre: number
  obligatoire: boolean
  photo_autorisee: boolean
}

interface Concertation {
  id: string
  titre: string
  slug: string
  design_config: any
}

interface PageProps {
  params: {
    slug: string
    questionIndex: string
  }
}

export default function QuestionPage({ params }: PageProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [concertation, setConcertation] = useState<Concertation | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [reponse, setReponse] = useState<any>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [reponses, setReponses] = useState<any>({})
  const [loading, setLoading] = useState(true)

  const questionIndex = parseInt(params.questionIndex)

  useEffect(() => {
    // Générer ou récupérer le session_id
    let sid = localStorage.getItem('purpl_session_id')
    if (!sid) {
      sid = uuidv4()
      localStorage.setItem('purpl_session_id', sid)
    }
    setSessionId(sid)

    // Charger les données
    loadData()
  }, [params.slug])

  useEffect(() => {
    if (questions.length > 0) {
      const question = questions[questionIndex]
      if (question) {
        setCurrentQuestion(question)
        // Charger la réponse existante si elle existe
        const existingReponse = reponses[question.id]
        if (existingReponse) {
          setReponse(existingReponse)
        } else {
          setReponse(null)
        }
      }
    }
  }, [questionIndex, questions])

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

      // Charger les questions
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('concertation_id', concertData.id)
        .order('ordre', { ascending: true })

      setQuestions(questionsData || [])
      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement:', error)
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (!currentQuestion || !concertation) return

    // Vérifier si la question est obligatoire
    if (currentQuestion.obligatoire && !reponse) {
      alert('Cette question est obligatoire')
      return
    }

    // Sauvegarder la réponse
    const newReponses = {
      ...reponses,
      [currentQuestion.id]: reponse
    }
    setReponses(newReponses)

    // Vérifier si c'est la dernière question
    if (questionIndex === questions.length - 1) {
      // Sauvegarder toutes les réponses en base
      await supabase.from('reponses').insert({
        concertation_id: concertation.id,
        session_id: sessionId,
        reponse_data: newReponses
      })

      // Rediriger vers la page de remerciement
      router.push(`/c/${params.slug}/merci`)
    } else {
      // Question suivante
      router.push(`/c/${params.slug}/q/${questionIndex + 1}`)
    }
  }

  const handlePrevious = () => {
    if (questionIndex > 0) {
      router.push(`/c/${params.slug}/q/${questionIndex - 1}`)
    } else {
      router.push(`/c/${params.slug}`)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  if (!currentQuestion || !concertation) {
    return <div className="text-center py-12">Question non trouvée</div>
  }

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
        {/* Progression */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Question {questionIndex + 1} sur {questions.length}</span>
            <span>{Math.round(((questionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all"
              style={{
                width: `${((questionIndex + 1) / questions.length) * 100}%`,
                backgroundColor: designConfig.primaryColor || '#3b82f6'
              }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 
          className="text-2xl font-bold mb-6"
          style={{
            fontFamily: designConfig.fontFamily || 'inherit',
          }}
        >
          {currentQuestion.question_text}
          {currentQuestion.obligatoire && <span className="text-red-500 ml-1">*</span>}
        </h2>

        {/* Image si présente */}
        {currentQuestion.image_url && (
          <img 
            src={currentQuestion.image_url} 
            alt="Question"
            className="w-full max-h-64 object-cover rounded-lg mb-6"
          />
        )}

        {/* Champ de réponse selon le type */}
        <div className="mb-8">
          {currentQuestion.type === 'texte_court' && (
            <input
              type="text"
              value={reponse || ''}
              onChange={(e) => setReponse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: designConfig.primaryColor || '#3b82f6'
              }}
            />
          )}

          {currentQuestion.type === 'texte_long' && (
            <textarea
              value={reponse || ''}
              onChange={(e) => setReponse(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: designConfig.primaryColor || '#3b82f6'
              }}
            />
          )}

          {currentQuestion.type === 'choix_unique' && currentQuestion.options?.choices && (
            <div className="space-y-3">
              {currentQuestion.options.choices.map((choice: string, idx: number) => (
                <label 
                  key={idx}
                  className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50"
                  style={{
                    borderColor: reponse === choice ? (designConfig.primaryColor || '#3b82f6') : '#e5e7eb',
                    backgroundColor: reponse === choice ? `${designConfig.primaryColor || '#3b82f6'}10` : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="choix"
                    value={choice}
                    checked={reponse === choice}
                    onChange={(e) => setReponse(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'choix_multiple' && currentQuestion.options?.choices && (
            <div className="space-y-3">
              {currentQuestion.options.choices.map((choice: string, idx: number) => (
                <label 
                  key={idx}
                  className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50"
                  style={{
                    borderColor: reponse?.includes(choice) ? (designConfig.primaryColor || '#3b82f6') : '#e5e7eb',
                    backgroundColor: reponse?.includes(choice) ? `${designConfig.primaryColor || '#3b82f6'}10` : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    value={choice}
                    checked={reponse?.includes(choice) || false}
                    onChange={(e) => {
                      const currentReponses = reponse || []
                      if (e.target.checked) {
                        setReponse([...currentReponses, choice])
                      } else {
                        setReponse(currentReponses.filter((r: string) => r !== choice))
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'echelle' && currentQuestion.options && (
            <div className="flex justify-between items-center">
              <span className="text-sm">{currentQuestion.options.min_label || 'Min'}</span>
              <div className="flex space-x-2">
                {Array.from(
                  { length: (currentQuestion.options.max || 10) - (currentQuestion.options.min || 1) + 1 },
                  (_, i) => (currentQuestion.options.min || 1) + i
                ).map((value) => (
                  <button
                    key={value}
                    onClick={() => setReponse(value)}
                    className="w-10 h-10 rounded-lg border-2 font-medium transition-all"
                    style={{
                      borderColor: reponse === value ? (designConfig.primaryColor || '#3b82f6') : '#e5e7eb',
                      backgroundColor: reponse === value ? (designConfig.primaryColor || '#3b82f6') : 'white',
                      color: reponse === value ? 'white' : '#000000'
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-sm">{currentQuestion.options.max_label || 'Max'}</span>
            </div>
          )}
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            className="px-6 py-2 rounded-lg border-2 font-medium transition-colors"
            style={{
              borderColor: designConfig.primaryColor || '#3b82f6',
              color: designConfig.primaryColor || '#3b82f6'
            }}
          >
            Précédent
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: designConfig.primaryColor || '#3b82f6',
              color: '#ffffff'
            }}
          >
            {questionIndex === questions.length - 1 ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  )
}