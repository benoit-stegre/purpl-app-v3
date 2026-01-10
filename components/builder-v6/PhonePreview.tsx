'use client'

import { useEffect } from 'react'

import { DesignConfigV6 } from '@/types/design-v6'
import TitreInlineEditor from './TitreInlineEditor'
import ResumeConcertationInlineEditor from './ResumeConcertationInlineEditor'
import TexteObligatoireInlineEditor from './TexteObligatoireInlineEditor'
import ExplanationLongueInlineEditor from './ExplanationLongueInlineEditor'
import LogoHeaderInlineEditor from './LogoHeaderInlineEditor'
import LogosPartenairesInlineEditor from './LogosPartenairesInlineEditor'
import PhotoInlineEditor from './PhotoInlineEditor'
import ButtonInlineEditor from './ButtonInlineEditor'
import InlineEditorWrapper from './InlineEditorWrapper'
import { useInlineEditor } from '@/hooks/useInlineEditor'
import { isRichTextEmpty } from '@/lib/isRichTextEmpty'

interface PhonePreviewProps {
  designConfig: DesignConfigV6
  onRubriqueClick: (rubrique: string) => void
  onDesignUpdate?: (newConfig: DesignConfigV6) => void
  concertationId: string
}

export default function PhonePreview({ designConfig, onRubriqueClick, onDesignUpdate, concertationId }: PhonePreviewProps) {
  const { activeRubrique } = useInlineEditor()

  // Bloquer le scroll du téléphone quand une rubrique est active
  useEffect(() => {
    const phoneScrollable = document.querySelector('.phone-scrollable')
    if (phoneScrollable) {
      if (activeRubrique) {
        phoneScrollable.classList.add('overflow-hidden')
      } else {
        phoneScrollable.classList.remove('overflow-hidden')
      }
    }
    return () => {
      if (phoneScrollable) {
        phoneScrollable.classList.remove('overflow-hidden')
      }
    }
  }, [activeRubrique])

  const handleUpdate = (updates: Partial<DesignConfigV6>) => {
    if (onDesignUpdate) {
      onDesignUpdate({ ...designConfig, ...updates })
    }
  }

  const fond = designConfig.fond || { type: 'color', value: '#FFFFFF' }

  const backgroundStyle = fond.type === 'color'
    ? { backgroundColor: fond.value }
    : { backgroundImage: 'url(' + fond.value + ')', backgroundSize: 'cover', backgroundPosition: 'center' }

  return (
    <div className="relative mx-auto phone-preview-container" style={{ width: '395px', height: '832px' }}>
      <style dangerouslySetInnerHTML={{
        __html: '.phone-scrollable::-webkit-scrollbar { width: 6px; } .phone-scrollable::-webkit-scrollbar-track { background: transparent; } .phone-scrollable::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 10px; } .phone-scrollable::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); } .phone-scrollable { scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; }'
      }} />

      <div className="absolute inset-0 rounded-[60px] border-[14px] border-gray-900 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10" />

        <div
          className="phone-scrollable h-full overflow-y-auto"
          style={backgroundStyle}
        >
          <div className="p-6 space-y-4 pt-10">

            <InlineEditorWrapper
              title="Votre logo"
              isEmpty={designConfig.logoHeader.length === 0}
              isActive={activeRubrique === 'logoHeader'}
            >
              <LogoHeaderInlineEditor 
                designConfig={designConfig} 
                onUpdate={handleUpdate}
                concertationId={concertationId}
              />
            </InlineEditorWrapper>

            <InlineEditorWrapper
              title="Titre"
              isEmpty={!designConfig.titre.text}
              isActive={activeRubrique === 'titre'}
            >
              <TitreInlineEditor designConfig={designConfig} onUpdate={handleUpdate} />      
            </InlineEditorWrapper>

            <InlineEditorWrapper
              title="Photo"
              isEmpty={!designConfig.photo?.url}
              isActive={activeRubrique === 'photo'}
            >
              <PhotoInlineEditor 
                designConfig={designConfig} 
                onUpdate={handleUpdate}
                concertationId={concertationId}
              />
            </InlineEditorWrapper>

            <InlineEditorWrapper
              title="Résumé de la concertation"
              isEmpty={isRichTextEmpty(designConfig.explanationCourte.content)}
              isActive={activeRubrique === 'explanationCourte'}
            >
              <ResumeConcertationInlineEditor designConfig={designConfig} onUpdate={handleUpdate} />
            </InlineEditorWrapper>

            <InlineEditorWrapper
              title="Bouton"
              isEmpty={!designConfig.bouton?.text}
              isActive={activeRubrique === 'bouton'}
            >
              <ButtonInlineEditor designConfig={designConfig} onUpdate={handleUpdate} />
            </InlineEditorWrapper>

            <InlineEditorWrapper
              title="Explication longue"
              isEmpty={designConfig.explanationLongue.length === 0 || isRichTextEmpty(designConfig.explanationLongue[0]?.content)}
              isActive={activeRubrique === 'explanationLongue'}
            >
              <ExplanationLongueInlineEditor designConfig={designConfig} onUpdate={handleUpdate} />
            </InlineEditorWrapper>

            <InlineEditorWrapper
              title="Obligation légale"
              isEmpty={isRichTextEmpty(designConfig.texteObligatoire.content)}
              isActive={activeRubrique === 'texteObligatoire'}
            >
              <TexteObligatoireInlineEditor designConfig={designConfig} onUpdate={handleUpdate} />
            </InlineEditorWrapper>

            <InlineEditorWrapper
              title="Logos partenaires"
              isEmpty={designConfig.logosPartenaires.length === 0}
              isActive={activeRubrique === 'logosPartenaires'}
            >
              <LogosPartenairesInlineEditor 
                designConfig={designConfig} 
                onUpdate={handleUpdate}
                concertationId={concertationId}
              />
            </InlineEditorWrapper>

          </div>
        </div>
      </div>
    </div>
  )
}