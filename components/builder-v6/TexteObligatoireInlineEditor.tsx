'use client'

import React, { useRef, useState, useEffect } from 'react'
import { DesignConfigV6 } from '@/types/design-v6'
import RichTextEditor, { RichTextEditorHandle } from './RichTextEditor'
import FloatingToolbar from './FloatingToolbar'
import SidePanel from './SidePanel'
import { useInlineEditor } from '@/hooks/useInlineEditor'
import { addColorToPalette } from '@/lib/addColorToPalette'
import { getStandardToolbarPosition } from '@/lib/utils/toolbarPosition'

interface TexteObligatoireInlineEditorProps {
  designConfig: DesignConfigV6
  onUpdate: (updates: Partial<DesignConfigV6>) => void
}

export default function TexteObligatoireInlineEditor({
  designConfig,
  onUpdate
}: TexteObligatoireInlineEditorProps) {
  
  const containerRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<RichTextEditorHandle>(null)
  
  const { 
    activeRubrique, 
    activateRubrique, 
    deactivateRubrique,
    toolbarPosition, 
    setToolbarPosition,
    sidePanelOpen, 
    setSidePanelOpen,
    sidePanelType,
    setSidePanelType
  } = useInlineEditor()

  const [tempTextColor, setTempTextColor] = useState<string | null>(null)
  const [tempBackgroundColor, setTempBackgroundColor] = useState<string | null>(null)
  const [tempBorderColor, setTempBorderColor] = useState<string | null>(null)
  const [hasSelection, setHasSelection] = useState(false)

  const isActive = activeRubrique === 'texteObligatoire'

  const handleFocus = () => {
    // Essayer de définir la position immédiatement (synchrone)
    const position = getStandardToolbarPosition()
    if (position) {
      setToolbarPosition(position)
    }
    activateRubrique('texteObligatoire')
  }

  // Mettre à jour la position quand la rubrique devient active
  useEffect(() => {
    if (!isActive) return

    const updatePosition = () => {
      const position = getStandardToolbarPosition()
      if (position) {
        setToolbarPosition(position)
      }
    }

    // Si la position n'est pas déjà définie, essayer de la trouver
    if (!toolbarPosition) {
      updatePosition()
    }

    const timeoutId = setTimeout(updatePosition, 50)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isActive, setToolbarPosition]) // Retirer toolbarPosition des dépendances pour éviter la boucle infinie

  const handleFontChange = (font: string) => {
    onUpdate({
      texteObligatoire: {
        ...designConfig.texteObligatoire,
        font
      }
    })
  }

  const handleSizeChange = (fontSize: number) => {
    onUpdate({
      texteObligatoire: {
        ...designConfig.texteObligatoire,
        fontSize
      }
    })
  }

  const handleBoldToggle = () => {
    editorRef.current?.toggleBold()
  }

  const handleItalicToggle = () => {
    editorRef.current?.toggleItalic()
  }

  const handleUnderlineToggle = () => {
    editorRef.current?.toggleUnderline()
  }

  const handleColorClick = () => {
    setSidePanelType('color')
    setSidePanelOpen(true)
  }

  const handleAlignClick = () => {
    setSidePanelType('alignment')
    setSidePanelOpen(true)
  }

  const handleCadreClick = () => {
    setSidePanelType('cadre')
    setSidePanelOpen(true)
  }

  const handleColorChange = (color: string) => {
    setTempTextColor(color)
    onUpdate({
      texteObligatoire: {
        ...designConfig.texteObligatoire,
        color
      }
    })
  }

  const handleAlignChange = (align: 'left' | 'center' | 'right' | 'justify') => {
    onUpdate({
      texteObligatoire: {
        ...designConfig.texteObligatoire,
        textAlign: align
      }
    })
  }

  const handleCadreToggle = () => {
    onUpdate({
      texteObligatoire: {
        ...designConfig.texteObligatoire,
        cadre: {
          ...designConfig.texteObligatoire.cadre,
          enabled: !designConfig.texteObligatoire.cadre.enabled
        }
      }
    })
  }

  const handleCadreChange = (cadreUpdates: any) => {
    if (cadreUpdates.backgroundColor && cadreUpdates.backgroundColor !== designConfig.texteObligatoire.cadre.backgroundColor) {
      setTempBackgroundColor(cadreUpdates.backgroundColor)
    }
    
    if (cadreUpdates.border?.color && cadreUpdates.border.color !== designConfig.texteObligatoire.cadre.border?.color) {
      setTempBorderColor(cadreUpdates.border.color)
    }
    
    onUpdate({
      texteObligatoire: {
        ...designConfig.texteObligatoire,
        cadre: {
          ...designConfig.texteObligatoire.cadre,
          ...cadreUpdates
        }
      }
    })
  }

  const handleContentChange = (html: string) => {
    onUpdate({
      texteObligatoire: {
        ...designConfig.texteObligatoire,
        content: html
      }
    })
  }

  const handleClose = () => {
    deactivateRubrique()
    setSidePanelOpen(false)
  }

  useEffect(() => {
    if (!sidePanelOpen && isActive) {
      let newColors = [...designConfig.projectColors]
      
      if (tempTextColor) {
        newColors = addColorToPalette(newColors, tempTextColor)
        setTempTextColor(null)
      }
      if (tempBackgroundColor) {
        newColors = addColorToPalette(newColors, tempBackgroundColor)
        setTempBackgroundColor(null)
      }
      if (tempBorderColor) {
        newColors = addColorToPalette(newColors, tempBorderColor)
        setTempBorderColor(null)
      }
      
      if (newColors.length !== designConfig.projectColors.length) {
        onUpdate({ projectColors: newColors })
      }
    }
  }, [sidePanelOpen, isActive])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isActive) return

      const target = event.target as Node
      const clickedInContainer = containerRef.current?.contains(target)
      const clickedInToolbar = toolbarRef.current?.contains(target)
      const clickedInSidePanel = sidePanelRef.current?.contains(target)

      if (clickedInContainer || clickedInToolbar || clickedInSidePanel) {
        return
      }

      if (sidePanelOpen) {
        setSidePanelOpen(false)
      } else {
        deactivateRubrique()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActive, sidePanelOpen])

  return (
    <div ref={containerRef} className="relative w-full">
      <RichTextEditor
        ref={editorRef}
        content={designConfig.texteObligatoire.content}
        font={designConfig.texteObligatoire.font}
        fontSize={designConfig.texteObligatoire.fontSize}
        color={designConfig.texteObligatoire.color}
        textAlign={designConfig.texteObligatoire.textAlign}
        placeholder={'Obligation légale'}
        cadre={designConfig.texteObligatoire.cadre}
        isActive={isActive}
        onFocus={handleFocus}
        onBlur={() => {}}
        onChange={handleContentChange}
        onSelectionChange={setHasSelection}
      />

      {isActive && toolbarPosition && (
        <div ref={toolbarRef}>
          <FloatingToolbar
            position={toolbarPosition}
            font={designConfig.texteObligatoire.font}
            fontSize={designConfig.texteObligatoire.fontSize}
            color={designConfig.texteObligatoire.color}
            bold={false}
            italic={false}
            underline={false}
            cadreEnabled={designConfig.texteObligatoire.cadre.enabled || designConfig.texteObligatoire.cadre.border?.enabled || false}
            onFontChange={handleFontChange}
            onSizeChange={handleSizeChange}
            onBoldToggle={handleBoldToggle}
            onItalicToggle={handleItalicToggle}
            onUnderlineToggle={handleUnderlineToggle}
            onColorClick={handleColorClick}
            onAlignClick={handleAlignClick}
            onCadreClick={handleCadreClick}
            onClose={handleClose}
          />
        </div>
      )}

      {isActive && sidePanelOpen && toolbarPosition && (
        <div ref={sidePanelRef}>
          <SidePanel
            type={sidePanelType}
            position={toolbarPosition}
            color={sidePanelType === 'color' ? designConfig.texteObligatoire.color : undefined}
            textAlign={sidePanelType === 'alignment' ? designConfig.texteObligatoire.textAlign : undefined}
            cadre={sidePanelType === 'cadre' ? designConfig.texteObligatoire.cadre : undefined}
            projectColors={designConfig.projectColors}
            onColorChange={handleColorChange}
            onAlignChange={handleAlignChange}
            onCadreToggle={handleCadreToggle}
            onCadreChange={handleCadreChange}
            onClose={() => setSidePanelOpen(false)}
          />
        </div>
      )}
    </div>
  )
}