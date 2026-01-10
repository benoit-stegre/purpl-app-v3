'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { RubriqueType, DEFAULT_DESIGN_V6, DesignConfigV6 } from '@/types/design-v6'
import { useDesignHistory } from '@/hooks/useDesignHistory'
import HeaderEditor from '@/components/builder-v6/HeaderEditor'
import PhonePreview from '@/components/builder-v6/PhonePreview'
import AvatarOverlay from '@/components/builder-v6/AvatarOverlay'



function AccueilV6Content() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const concertationId = searchParams.get('id')

  const [concertationName, setConcertationName] = useState('Ma nouvelle concertation')       
  const [selectedRubrique, setSelectedRubrique] = useState<RubriqueType | null>(null)        
  const [isLoading, setIsLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [isSaved, setIsSaved] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const designConfig = useDesignHistory((state) => state.present)
  const setDesignConfig = useDesignHistory((state) => state.set)
  const undo = useDesignHistory((state) => state.undo)
  const redo = useDesignHistory((state) => state.redo)
  const canUndo = useDesignHistory((state) => state.canUndo())
  const canRedo = useDesignHistory((state) => state.canRedo())
  const resetHistory = useDesignHistory((state) => state.reset)

  // Redirection si pas d'ID de concertation
  useEffect(() => {
    if (!concertationId) {
      console.error('Aucun ID de concertation fourni - Redirection')
      router.push('/dashboard/concertations')
    }
  }, [concertationId, router])

  useEffect(() => {
    const calculateScale = () => {
      const headerHeight = 80
      const padding = 40
      const availableHeight = window.innerHeight - headerHeight - padding
      const avatarHeight = 832

      const calculatedScale = Math.min(availableHeight / avatarHeight, 1)
      setScale(calculatedScale)
    }

    calculateScale()
    window.addEventListener('resize', calculateScale)
    return () => window.removeEventListener('resize', calculateScale)
  }, [])

  useEffect(() => {
    if (!concertationId) return

    async function loadConcertation() {
      const { data, error } = await supabase
        .from('concertations')
        .select('titre, design_config')
        .eq('id', concertationId)
        .single()

      if (error) {
        console.error('Erreur chargement concertation:', error)
        setIsLoading(false)
        return
      }

      if (data) {
        setConcertationName(data.titre || 'Sans titre')

        if (data.design_config) {
          const loadedConfig = { ...DEFAULT_DESIGN_V6, ...data.design_config }
          resetHistory(loadedConfig)
        }
      }

      setIsLoading(false)
    }

    loadConcertation()
  }, [concertationId, supabase, resetHistory])

  useEffect(() => {
    if (!concertationId || isLoading) return

    setIsSaved(false)

    const timeoutId = setTimeout(async () => {
      const { error } = await supabase
        .from('concertations')
        .update({ design_config: designConfig })
        .eq('id', concertationId)

      if (error) {
        console.error('Erreur auto-save design:', error)
        setIsSaved(false)
      } else {
        console.log('✅ Design auto-sauvegardé')
        setIsSaved(true)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [designConfig, concertationId, isLoading, supabase])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey && e.key === 'z') {
          e.preventDefault()
          redo()
        } else if (e.key === 'z') {
          e.preventDefault()
          undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const handleNameChange = async (name: string) => {
    if (!concertationId) return
    
    setConcertationName(name)
    setIsSaved(false)

    const { error } = await supabase
      .from('concertations')
      .update({ titre: name })
      .eq('id', concertationId)

    if (error) {
      console.error('Erreur sauvegarde nom:', error)
    } else {
      setIsSaved(true)
    }
  }

  const handleNextStep = () => {
    router.push(`/dashboard/concertations/creer/questionnaire?id=${concertationId}`)
  }

  const handleRubriqueClick = (rubrique: string) => {
    setSelectedRubrique(rubrique as RubriqueType)
  }

  const handleDesignUpdate = (newConfig: DesignConfigV6) => {
    setDesignConfig(newConfig)
  }

  const handleFondClick = () => {
    // Gestion du clic sur le fond (anciennement ouvrait le builder)
  }

  // Si pas de concertationId, ne rien afficher (redirection en cours)
  if (!concertationId) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <HeaderEditor
        concertationName={concertationName}
        onNameChange={handleNameChange}
        onNextStep={handleNextStep}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        isSaved={isSaved}
      />

      <main
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden"
      >
        <div className="relative">
          <div
            style={{
              width: '395px',
              height: '832px',
              transform: `scale(${scale})`,
              transformOrigin: 'center center'
            }}
          >
            <AvatarOverlay
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onFondClick={handleFondClick}
            />

            <PhonePreview
              designConfig={designConfig}
              onRubriqueClick={handleRubriqueClick}
              onDesignUpdate={handleDesignUpdate}
              concertationId={concertationId}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AccueilV6Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AccueilV6Content />
    </Suspense>
  )
}