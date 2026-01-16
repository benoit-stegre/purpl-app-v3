'use client'

import React, { useRef, useState, useEffect } from 'react'
import { DesignConfigV6 } from '@/types/design-v6'
import EditableText from './EditableText'
import FloatingToolbar from './FloatingToolbar'
import SidePanel from './SidePanel'
import { useInlineEditor } from '@/hooks/useInlineEditor'
import { addColorToPalette } from '@/lib/addColorToPalette'
import { getStandardToolbarPosition } from '@/lib/utils/toolbarPosition'

interface TitreInlineEditorProps {
  designConfig: DesignConfigV6
  onUpdate: (updates: Partial<DesignConfigV6>) => void
}

export default function TitreInlineEditor({
  designConfig,
  onUpdate
}: TitreInlineEditorProps) {
  
  const containerRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  
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

  const isActive = activeRubrique === 'titre'

  const handleFocus = () => {
    console.log('[TitreInlineEditor] handleFocus appelé')
    // IMPORTANT: Définir la position AVANT d'activer la rubrique
    // pour éviter que deactivateRubrique ne remette toolbarPosition à null
    const position = getStandardToolbarPosition()
    console.log('[TitreInlineEditor] Position trouvée dans handleFocus:', position)
    if (position) {
      console.log('[TitreInlineEditor] Définition de toolbarPosition:', position)
      setToolbarPosition(position)
    }
    // Activer la rubrique APRÈS avoir défini la position
    console.log('[TitreInlineEditor] Activation de la rubrique titre')
    activateRubrique('titre')
  }

  // Mettre à jour la position quand la rubrique devient active (comme BuilderSmall)
  useEffect(() => {
    if (!isActive) return

    const updatePosition = () => {
      const position = getStandardToolbarPosition()
      if (position) {
        setToolbarPosition(position)
      }
    }

    // Essayer immédiatement
    updatePosition()

    // Réessayer après un court délai pour s'assurer que le DOM est prêt
    const timeoutId = setTimeout(updatePosition, 50)

    // Écouter les changements de scroll/resize pour mettre à jour la position
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isActive, setToolbarPosition]) // Retirer toolbarPosition des dépendances pour éviter la boucle infinie

  const handleTextChange = (text: string) => {
    onUpdate({
      titre: {
        ...designConfig.titre,
        text
      }
    })
  }

  const handleFontChange = (font: string) => {
    onUpdate({
      titre: {
        ...designConfig.titre,
        font
      }
    })
  }

  const handleSizeChange = (fontSize: number) => {
    onUpdate({
      titre: {
        ...designConfig.titre,
        fontSize
      }
    })
  }

  const handleBoldToggle = () => {
    onUpdate({
      titre: {
        ...designConfig.titre,
        bold: !designConfig.titre.bold
      }
    })
  }

  const handleItalicToggle = () => {
    onUpdate({
      titre: {
        ...designConfig.titre,
        italic: !designConfig.titre.italic
      }
    })
  }

  const handleUnderlineToggle = () => {
    onUpdate({
      titre: {
        ...designConfig.titre,
        underline: !designConfig.titre.underline
      }
    })
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
      titre: {
        ...designConfig.titre,
        color
      }
    })
  }

  const handleAlignChange = (align: 'left' | 'center' | 'right' | 'justify') => {
    onUpdate({
      titre: {
        ...designConfig.titre,
        textAlign: align
      }
    })
  }

  const handleCadreToggle = () => {
    onUpdate({
      titre: {
        ...designConfig.titre,
        cadre: {
          ...designConfig.titre.cadre,
          enabled: !designConfig.titre.cadre.enabled
        }
      }
    })
  }

  const handleCadreChange = (cadreUpdates: any) => {
    if (cadreUpdates.backgroundColor && cadreUpdates.backgroundColor !== designConfig.titre.cadre.backgroundColor) {
      setTempBackgroundColor(cadreUpdates.backgroundColor)
    }
    
    if (cadreUpdates.border?.color && cadreUpdates.border.color !== designConfig.titre.cadre.border?.color) {
      setTempBorderColor(cadreUpdates.border.color)
    }
    
    onUpdate({
      titre: {
        ...designConfig.titre,
        cadre: {
          ...designConfig.titre.cadre,
          ...cadreUpdates
        }
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
      const targetElement = target as Element
      
      // Exclure les clics dans le container
      if (containerRef.current?.contains(target)) return
      
      // Exclure les clics dans le FloatingToolbar (via data-attribute)
      if (targetElement.closest?.('[data-floating-toolbar]')) return
      
      // Exclure les clics dans le SidePanel (via data-attribute)
      if (targetElement.closest?.('[data-side-panel]')) return

      if (sidePanelOpen) {
        setSidePanelOpen(false)
      } else {
        deactivateRubrique()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActive, sidePanelOpen, deactivateRubrique, setSidePanelOpen])

  return (
    <div 
      ref={containerRef} 
      className="relative w-full"
      onClick={(e) => {
        // Si on clique sur le container mais pas sur le textarea, activer la rubrique
        const target = e.target as HTMLElement
        if (!target.closest('textarea')) {
          console.log('[TitreInlineEditor] Clic sur le container (pas textarea)')
          handleFocus()
          // Focuser le textarea pour que l'utilisateur puisse taper
          const textarea = containerRef.current?.querySelector('textarea')
          if (textarea) {
            textarea.focus()
          }
        }
      }}
    >
      <EditableText
        text={designConfig.titre.text}
        font={designConfig.titre.font}
        fontSize={designConfig.titre.fontSize}
        color={designConfig.titre.color}
        textAlign={designConfig.titre.textAlign}
        bold={designConfig.titre.bold}
        italic={designConfig.titre.italic}
        underline={designConfig.titre.underline}
        placeholder={'Titre'}
        cadre={designConfig.titre.cadre}
        isActive={isActive}
        onFocus={handleFocus}
        onBlur={() => {}}
        onChange={handleTextChange}
      />

      {isActive && toolbarPosition && (
        <div ref={toolbarRef}>
          {console.log('[TitreInlineEditor] RENDERING FloatingToolbar avec position:', toolbarPosition)}
          <FloatingToolbar
            position={toolbarPosition}
            font={designConfig.titre.font}
            fontSize={designConfig.titre.fontSize}
            color={designConfig.titre.color}
            bold={designConfig.titre.bold}
            italic={designConfig.titre.italic}
            underline={designConfig.titre.underline}
            cadreEnabled={designConfig.titre.cadre.enabled || designConfig.titre.cadre.border?.enabled || false}
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
            color={sidePanelType === 'color' ? designConfig.titre.color : undefined}
            textAlign={sidePanelType === 'alignment' ? designConfig.titre.textAlign : undefined}
            cadre={sidePanelType === 'cadre' ? designConfig.titre.cadre : undefined}
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