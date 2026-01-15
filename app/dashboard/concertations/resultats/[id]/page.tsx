'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import WordCloud from 'react-d3-cloud'

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
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false)
  const [chartTypes, setChartTypes] = useState<{ [questionId: string]: 'pie' | 'bar' | 'donut' }>({})

  // Palette de couleurs PURPL
  const PURPL_COLORS = ["#ED693A", "#76715A", "#2F2F2E", "#5C9EAD", "#9B5DE5", "#F4D35E"]

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
    setExportDropdownOpen(false)
  }

  // Calculer le taux de complétion
  const calculateCompletionRate = () => {
    if (reponses.length === 0 || questions.length === 0) return '-'
    
    // Compter le nombre moyen de questions répondues par réponse
    let totalAnswered = 0
    reponses.forEach(r => {
      const answeredCount = questions.filter(q => {
        const reponse = r.reponse_data[q.id]
        return reponse !== null && reponse !== undefined && reponse !== ''
      }).length
      totalAnswered += answeredCount
    })
    
    const avgAnswered = totalAnswered / reponses.length
    const rate = Math.round((avgAnswered / questions.length) * 100)
    return `${rate}%`
  }

  // Obtenir le type de graphique pour une question
  const getChartType = (questionId: string): 'pie' | 'bar' | 'donut' => {
    return chartTypes[questionId] || 'pie'
  }

  // Changer le type de graphique
  const setChartType = (questionId: string, type: 'pie' | 'bar' | 'donut') => {
    setChartTypes(prev => ({ ...prev, [questionId]: type }))
  }

  // Préparer les données pour les graphiques
  const prepareChartData = (analysis: { [key: string]: number }, totalResponses: number) => {
    return Object.entries(analysis).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalResponses) * 100)
    }))
  }

  // Mots courants français à exclure
  const STOP_WORDS = new Set([
    'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'en', 'au', 'aux', 'à', 'pour', 'par', 'sur', 'avec', 'dans',
    'qui', 'que', 'quoi', 'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'leur', 'leurs',
    'nous', 'vous', 'ils', 'elles', 'je', 'tu', 'il', 'elle', 'on', 'ne', 'pas', 'plus', 'très', 'bien', 'aussi', 'donc',
    'mais', 'car', 'ni', 'si', 'comme', 'tout', 'tous', 'être', 'avoir', 'faire', 'dit', 'fait', 'été', 'sont', 'est', 'a', 'ont'
  ])

  // Extraire les mots des réponses texte pour le nuage de mots
  const extractWordsForWordCloud = (responses: string[]): { text: string; value: number }[] => {
    const wordCount: { [key: string]: number } = {}

    responses.forEach(response => {
      if (typeof response === 'string' && response.trim()) {
        // Séparer en mots, convertir en minuscules, enlever la ponctuation
        const words = response
          .toLowerCase()
          .replace(/[.,!?;:()\[\]{}'"]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2) // Ignorer les mots trop courts

        words.forEach(word => {
          const cleanWord = word.trim()
          if (cleanWord && !STOP_WORDS.has(cleanWord)) {
            wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1
          }
        })
      }
    })

    // Convertir en tableau et trier par fréquence
    return Object.entries(wordCount)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50) // Limiter à 50 mots les plus fréquents
  }

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-export-dropdown]')) {
        setExportDropdownOpen(false)
      }
    }
    if (exportDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [exportDropdownOpen])

  if (loading) {
    return (
      <div 
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: '#EDEAE3' }}
      >
        <div style={{ color: '#2F2F2E' }}>Chargement...</div>
      </div>
    )
  }

  if (!concertation) {
    return (
      <div 
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: '#EDEAE3' }}
      >
        <div style={{ color: '#2F2F2E' }}>Concertation non trouvée</div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: '#EDEAE3' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/concertations/resultats"
              className="p-2 rounded-lg transition-colors flex items-center gap-2"
              style={{ 
                backgroundColor: '#FFFEF5',
                border: '2px solid #EDEAE3',
                color: '#2F2F2E'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFEF5'
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 
                className="text-2xl sm:text-3xl font-bold mb-1"
                style={{ color: '#2F2F2E' }}
              >
                {concertation.titre}
              </h1>
              <p style={{ color: '#76715A' }}>
                {reponses.length} réponse{reponses.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* Dropdown Export */}
          <div className="relative" data-export-dropdown>
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: '#ED693A' }}
            >
              <Download className="w-4 h-4" />
              Exporter
              <ChevronDown className={`w-4 h-4 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {exportDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg overflow-hidden z-50"
                style={{ 
                  backgroundColor: '#FFFEF5',
                  border: '2px solid #EDEAE3'
                }}
              >
                <button
                  onClick={exportCSV}
                  className="w-full text-left px-4 py-3 hover:bg-[#EDEAE3] transition-colors flex items-center gap-2"
                  style={{ color: '#2F2F2E' }}
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  disabled
                  className="w-full text-left px-4 py-3 opacity-50 cursor-not-allowed flex items-center gap-2"
                  style={{ color: '#76715A' }}
                >
                  Excel (bientôt)
                </button>
                <button
                  disabled
                  className="w-full text-left px-4 py-3 opacity-50 cursor-not-allowed flex items-center gap-2"
                  style={{ color: '#76715A' }}
                >
                  PDF (bientôt)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques globales - 4 cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{ 
              backgroundColor: '#FFFEF5',
              border: '2px solid #EDEAE3'
            }}
          >
            <p 
              className="text-sm mb-2"
              style={{ color: '#76715A' }}
            >
              Total réponses
            </p>
            <p 
              className="text-3xl font-bold"
              style={{ color: '#ED693A' }}
            >
              {reponses.length}
            </p>
          </div>
          <div 
            className="rounded-2xl p-6"
            style={{ 
              backgroundColor: '#FFFEF5',
              border: '2px solid #EDEAE3'
            }}
          >
            <p 
              className="text-sm mb-2"
              style={{ color: '#76715A' }}
            >
              Taux de complétion
            </p>
            <p 
              className="text-3xl font-bold"
              style={{ color: '#76715A' }}
            >
              {calculateCompletionRate()}
            </p>
          </div>
          <div 
            className="rounded-2xl p-6"
            style={{ 
              backgroundColor: '#FFFEF5',
              border: '2px solid #EDEAE3'
            }}
          >
            <p 
              className="text-sm mb-2"
              style={{ color: '#76715A' }}
            >
              Questions
            </p>
            <p 
              className="text-3xl font-bold"
              style={{ color: '#2F2F2E' }}
            >
              {questions.length}
            </p>
          </div>
          <div 
            className="rounded-2xl p-6"
            style={{ 
              backgroundColor: '#FFFEF5',
              border: '2px solid #EDEAE3'
            }}
          >
            <p 
              className="text-sm mb-2"
              style={{ color: '#76715A' }}
            >
              Emails collectés
            </p>
            <p 
              className="text-3xl font-bold"
              style={{ color: '#ED693A' }}
            >
              {emails.length}
            </p>
          </div>
        </div>

        {/* Résultats par question */}
        <div className="space-y-6">
          {questions.map((question, index) => {
            const analysis = analyzeQuestion(question)
            const chartType = getChartType(question.id)
            const isChoiceQuestion = question.type === 'choix_unique' || question.type === 'choix_multiple'
            const chartData = isChoiceQuestion && reponses.length > 0 
              ? prepareChartData(analysis as { [key: string]: number }, reponses.length)
              : []

            return (
              <div 
                key={question.id} 
                className="rounded-2xl p-6"
                style={{ 
                  backgroundColor: '#FFFEF5',
                  border: '2px solid #EDEAE3'
                }}
              >
                <h3 
                  className="text-lg sm:text-xl font-bold mb-6"
                  style={{ color: '#2F2F2E' }}
                >
                  Question {index + 1} : {question.question_text}
                </h3>

                {/* Questions de type choix avec graphiques */}
                {isChoiceQuestion && reponses.length > 0 && (
                  <div className="space-y-4">
                    {/* Sélecteur de type de graphique */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setChartType(question.id, 'pie')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          chartType === 'pie' ? 'text-white' : ''
                        }`}
                        style={{
                          backgroundColor: chartType === 'pie' ? '#ED693A' : 'transparent',
                          color: chartType === 'pie' ? '#FFFFFF' : '#76715A',
                          border: chartType === 'pie' ? 'none' : '2px solid #EDEAE3'
                        }}
                      >
                        Camembert
                      </button>
                      <button
                        onClick={() => setChartType(question.id, 'donut')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          chartType === 'donut' ? 'text-white' : ''
                        }`}
                        style={{
                          backgroundColor: chartType === 'donut' ? '#ED693A' : 'transparent',
                          color: chartType === 'donut' ? '#FFFFFF' : '#76715A',
                          border: chartType === 'donut' ? 'none' : '2px solid #EDEAE3'
                        }}
                      >
                        Donut
                      </button>
                      <button
                        onClick={() => setChartType(question.id, 'bar')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          chartType === 'bar' ? 'text-white' : ''
                        }`}
                        style={{
                          backgroundColor: chartType === 'bar' ? '#ED693A' : 'transparent',
                          color: chartType === 'bar' ? '#FFFFFF' : '#76715A',
                          border: chartType === 'bar' ? 'none' : '2px solid #EDEAE3'
                        }}
                      >
                        Barres
                      </button>
                    </div>

                    {/* Graphique */}
                    <div className="w-full" style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'pie' || chartType === 'donut' ? (
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                              outerRadius={chartType === 'donut' ? 80 : 100}
                              innerRadius={chartType === 'donut' ? 40 : 0}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PURPL_COLORS[index % PURPL_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        ) : (
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EDEAE3" />
                            <XAxis 
                              dataKey="name" 
                              style={{ fill: '#76715A', fontSize: '12px' }}
                            />
                            <YAxis 
                              style={{ fill: '#76715A', fontSize: '12px' }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#FFFEF5',
                                border: '2px solid #EDEAE3',
                                borderRadius: '8px',
                                color: '#2F2F2E'
                              }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PURPL_COLORS[index % PURPL_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    {/* Liste détaillée sous le graphique */}
                    <div className="mt-4 space-y-2">
                      {Object.entries(analysis as { [key: string]: number }).map(([choice, count]) => (
                        <div 
                          key={choice} 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: '#EDEAE3' }}
                        >
                          <div className="flex justify-between items-center">
                            <span style={{ color: '#2F2F2E', fontWeight: 500 }}>{choice}</span>
                            <span style={{ color: '#76715A', fontWeight: 600 }}>
                              {count} ({Math.round((count / reponses.length) * 100)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question de type échelle */}
                {question.type === 'echelle' && (
                  <div className="text-center py-4">
                    <p 
                      className="text-5xl font-bold mb-2"
                      style={{ color: '#ED693A' }}
                    >
                      {(analysis as any).moyenne}
                    </p>
                    <p style={{ color: '#76715A' }}>
                      Moyenne sur {(analysis as any).total} réponse{(analysis as any).total > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* Questions de type texte */}
                {(question.type === 'texte_court' || question.type === 'texte_long') && (
                  <div className="space-y-6">
                    {/* Nuage de mots */}
                    {(analysis as string[]).length > 0 && (
                      <div 
                        className="rounded-xl p-6 flex items-center justify-center"
                        style={{ 
                          backgroundColor: '#FDFCF7',
                          border: '2px solid #EDEAE3'
                        }}
                      >
                        <WordCloud
                          data={extractWordsForWordCloud(analysis as string[])}
                          width={500}
                          height={300}
                          font="Inter"
                          fontSize={(word) => Math.log2(word.value) * 15 + 10}
                          rotate={0}
                          padding={2}
                        />
                      </div>
                    )}

                    {/* Liste des réponses */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {(analysis as string[]).length > 0 ? (
                        (analysis as string[]).map((reponse, idx) => (
                          <div 
                            key={idx} 
                            className="p-4 rounded-lg"
                            style={{ 
                              backgroundColor: '#EDEAE3',
                              border: '1px solid #D4D0C0'
                            }}
                          >
                            <p style={{ color: '#2F2F2E' }}>{reponse}</p>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#76715A', fontStyle: 'italic' }}>
                          Aucune réponse pour cette question
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Emails collectés */}
        {emails.length > 0 && (
          <div 
            className="mt-8 rounded-2xl p-6"
            style={{ 
              backgroundColor: '#FFFEF5',
              border: '2px solid #EDEAE3'
            }}
          >
            <h3 
              className="text-lg sm:text-xl font-bold mb-4"
              style={{ color: '#2F2F2E' }}
            >
              Emails collectés ({emails.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {emails.map((email, idx) => (
                <p 
                  key={idx} 
                  className="text-sm p-2 rounded-lg"
                  style={{ 
                    color: '#76715A',
                    backgroundColor: '#EDEAE3'
                  }}
                >
                  {email}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}