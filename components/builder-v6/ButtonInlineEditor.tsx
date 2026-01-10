'use client'

import React, { useRef, useState, useEffect } from 'react'
import { DesignConfigV6, DEFAULT_BUTTON_CONFIG } from '@/types/design-v6'
import EditableText from './EditableText'
import FloatingToolbar from './FloatingToolbar'
import SidePanel from './SidePanel'
import { useInlineEditor } from '@/hooks/useInlineEditor'
import { addColorToPalette } from '@/lib/addColorToPalette'
import { getStandardToolbarPosition } from '@/lib/utils/toolbarPosition'

interface ButtonInlineEditorProps {
  designConfig: DesignConfigV6
  onUpdate: (updates: Partial<DesignConfigV6>) => void
}

export default function ButtonInlineEditor({
  designConfig,
  onUpdate
}: ButtonInlineEditorProps) {
  
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

  const [isEditingText, setIsEditingText] = useState(false)
  const [tempTextColor, setTempTextColor] = useState<string | null>(null)
  const [tempBackgroundColor, setTempBackgroundColor] = useState<string | null>(null)
  const [tempBorderColor, setTempBorderColor] = useState<string | null>(null)
  const justClickedRef = useRef(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isActive = activeRubrique === 'bouton'

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Ne pas utiliser preventDefault() car cela empêche le double-clic
    if (isEditingText) return
    justClickedRef.current = true
    
    // Reset après un court délai pour permettre au FloatingToolbar de se monter
    setTimeout(() => {
      justClickedRef.current = false
    }, 300)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Ne pas utiliser preventDefault() pour permettre le double-clic
    if (isEditingText) return
    
    // Annuler le timeout précédent si on double-clique
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
      return // C'était un double-clic, ne pas traiter le simple clic
    }
    
    // Attendre un peu pour voir si c'est un double-clic
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null
      
      // Marquer qu'on vient de cliquer pour éviter la fermeture immédiate
      justClickedRef.current = true
      
      // Essayer de définir la position immédiatement (synchrone)
      const position = getStandardToolbarPosition()
      if (position) {
        setToolbarPosition(position)
      }
      
      // Activer la rubrique de manière synchrone
      activateRubrique('bouton')
    }, 300) // Délai pour détecter le double-clic
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault() // Prévenir le comportement par défaut du double-clic
    
    // Annuler le timeout du simple clic
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
    
    setIsEditingText(true)
    // Désactiver la rubrique pour fermer le FloatingToolbar
    deactivateRubrique()
  }

  const handleTextChange = (text: string) => {
    // Limiter à 25 caractères max
    const limitedText = text.length > 25 ? text.slice(0, 25) : text
    onUpdate({
      bouton: {
        ...designConfig.bouton,
        text: limitedText
      }
    })
    // Ne pas fermer le mode édition ici - on le ferme dans onBlur
  }

  const handleFontChange = (font: string) => {
    onUpdate({
      bouton: {
        ...designConfig.bouton,
        fontFamily: font
      }
    })
  }

  // La taille de police du bouton est fixe à 16px, pas de modification autorisée
  const handleSizeChange = (fontSize: number) => {
    // Ne rien faire - la taille reste fixe à 16px
  }

  const handleBoldToggle = () => {
    onUpdate({
      bouton: {
        ...designConfig.bouton,
        bold: !designConfig.bouton.bold
      }
    })
  }

  const handleColorClick = () => {
    setSidePanelType('color')
    setSidePanelOpen(true)
  }

  const handleCadreClick = () => {
    setSidePanelType('cadre')
    setSidePanelOpen(true)
  }

  const handleColorChange = (color: string) => {
    setTempTextColor(color)
    onUpdate({
      bouton: {
        ...designConfig.bouton,
        textColor: color
      }
    })
  }

  const handleCadreToggle = () => {
    onUpdate({
      bouton: {
        ...designConfig.bouton,
        hasBackground: !designConfig.bouton.hasBackground
      }
    })
  }

  const handleCadreChange = (cadreUpdates: any) => {
    // Gérer mise à jour ombre (si présent, c'est la seule mise à jour)
    if (cadreUpdates.shadow !== undefined && Object.keys(cadreUpdates).length === 1) {
      onUpdate({
        bouton: {
          ...designConfig.bouton,
          shadow: {
            ...designConfig.bouton.shadow,
            ...cadreUpdates.shadow
          }
        }
      })
      return
    }
    
    // Gérer mise à jour fond
    if (cadreUpdates.backgroundColor && cadreUpdates.backgroundColor !== designConfig.bouton.backgroundColor) {
      setTempBackgroundColor(cadreUpdates.backgroundColor)
    }
    
    // Gérer mise à jour couleur de bordure
    if (cadreUpdates.border?.color && cadreUpdates.border.color !== designConfig.bouton.border.color) {
      setTempBorderColor(cadreUpdates.border.color)
    }
    
    // Construire l'objet de mise à jour
    const boutonUpdates: any = {
      ...designConfig.bouton
    }
    
    // Mettre à jour backgroundColor si présent
    if (cadreUpdates.backgroundColor !== undefined) {
      boutonUpdates.backgroundColor = cadreUpdates.backgroundColor
    }
    
    // Mettre à jour hasBackground si présent
    if (cadreUpdates.enabled !== undefined) {
      boutonUpdates.hasBackground = cadreUpdates.enabled
    }
    
    // Mettre à jour border si présent
    if (cadreUpdates.border) {
      boutonUpdates.border = {
        ...designConfig.bouton.border,
        ...cadreUpdates.border,
        // S'assurer que hasBorder est correctement mappé
        hasBorder: cadreUpdates.border.enabled !== undefined 
          ? cadreUpdates.border.enabled 
          : designConfig.bouton.border.hasBorder
      }
    }
    
    // Mettre à jour borderRadius si présent
    if (cadreUpdates.borderRadius !== undefined) {
      boutonUpdates.border = {
        ...boutonUpdates.border || designConfig.bouton.border,
        radius: cadreUpdates.borderRadius
      }
    }
    
    // Mettre à jour shadow si présent (mais pas seul)
    if (cadreUpdates.shadow !== undefined) {
      boutonUpdates.shadow = {
        ...designConfig.bouton.shadow,
        ...cadreUpdates.shadow
      }
    }
    
    onUpdate({
      bouton: boutonUpdates
    })
  }

  const handleClose = () => {
    deactivateRubrique()
    setSidePanelOpen(false)
  }

  // Mettre à jour la position quand la rubrique devient active
  useEffect(() => {
    if (!isActive || isEditingText) return

    const updatePosition = () => {
      const position = getStandardToolbarPosition()
      if (position) {
        setToolbarPosition(position)
      }
    }

    // Essayer immédiatement
    updatePosition()

    const timeoutId = setTimeout(updatePosition, 50)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isActive, isEditingText, setToolbarPosition]) // Retirer toolbarPosition des dépendances pour éviter la boucle infinie

  // Restaurer le texte par défaut uniquement quand on sort du mode édition avec un texte vide
  const prevIsEditingTextRef = useRef(isEditingText)
  useEffect(() => {
    // Si on vient de sortir du mode édition (passage de true à false)
    if (prevIsEditingTextRef.current && !isEditingText) {
      // Et que le texte est vide, restaurer le texte par défaut
      if (!designConfig.bouton.text || designConfig.bouton.text.trim() === '') {
        onUpdate({
          bouton: {
            ...designConfig.bouton,
            text: DEFAULT_BUTTON_CONFIG.text
          }
        })
      }
    }
    prevIsEditingTextRef.current = isEditingText
  }, [isEditingText])

  // Gestion palette couleurs
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

  // Gestion clic extérieur
  useEffect(() => {
    if (!isActive) return
    
    const handleClickOutside = (event: MouseEvent) => {
      // Ignorer si on vient juste de cliquer sur le bouton
      if (justClickedRef.current) {
        return
      }

      const target = event.target as Node
      const targetElement = event.target as HTMLElement
      
      // Ignorer les clics sur les boutons du FloatingToolbar (ils ont des classes spécifiques)
      if (targetElement?.closest('.bg-white.border-2')) {
        return
      }

      const clickedInContainer = containerRef.current?.contains(target)
      const clickedInToolbar = toolbarRef.current?.contains(target)
      const clickedInSidePanel = sidePanelRef.current?.contains(target)

      if (clickedInContainer || clickedInToolbar || clickedInSidePanel) {
        return
      }

      // Si on est en mode édition de texte
      if (isEditingText) {
        const currentText = designConfig.bouton.text?.trim() || ''
        if (currentText === '') {
          // Si le texte est vide, ne pas fermer l'éditeur (comme dans onBlur)
          // Le useEffect restaurera automatiquement le texte quand on sortira du mode édition
          return
        }
        setIsEditingText(false)
        return
      }

      if (sidePanelOpen) {
        setSidePanelOpen(false)
      } else {
        deactivateRubrique()
      }
    }

    // Utiliser un délai pour éviter que le listener ne capture le clic d'activation
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [isActive, sidePanelOpen, isEditingText, designConfig.bouton.text])

  // Calcul du style du bouton
  // La taille de police est fixe à 16px pour éviter que le texte dépasse
  const buttonStyle: React.CSSProperties = {
    backgroundColor: designConfig.bouton.hasBackground 
      ? designConfig.bouton.backgroundColor 
      : 'transparent',
    
    color: designConfig.bouton.textColor,
    fontSize: '16px', // Taille fixe - ne change jamais
    fontFamily: designConfig.bouton.fontFamily,
    fontWeight: designConfig.bouton.bold ? 700 : 400,
    
    border: designConfig.bouton.border.hasBorder 
      ? `${designConfig.bouton.border.width}px solid ${designConfig.bouton.border.color}`
      : 'none',
    borderRadius: `${designConfig.bouton.border.radius}px`,
    
    boxShadow: designConfig.bouton.shadow.enabled
      ? `0 ${designConfig.bouton.shadow.offsetY}px ${designConfig.bouton.shadow.blur}px ${designConfig.bouton.shadow.color}`
      : 'none',
    
    padding: '16px 28px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '200px',
    maxWidth: '309px',
    minHeight: '44px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    wordBreak: 'break-word',
    whiteSpace: isEditingText ? 'nowrap' : 'normal', // Une seule ligne pendant l'édition
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.4' // Hauteur de ligne pour un meilleur rendu multi-lignes
  }

  return (
    <div ref={containerRef} className="flex justify-center py-4">
      <div className="relative">
        {isEditingText ? (
          <div style={buttonStyle}>
            <EditableText
              text={designConfig.bouton.text}
              font={designConfig.bouton.fontFamily}
              fontSize={16}
              color={designConfig.bouton.textColor}
              textAlign="center"
              bold={designConfig.bouton.bold}
              italic={false}
              underline={false}
              placeholder="Texte du bouton"
              cadre={{
                enabled: false,
                backgroundColor: 'transparent',
                borderRadius: 0,
                padding: 0
              }}
              isActive={true}
              onFocus={() => {}}
              onBlur={() => {
                // Si le texte est vide, ne pas fermer l'éditeur
                const currentText = designConfig.bouton.text?.trim() || ''
                if (currentText === '') {
                  // Ne pas fermer l'éditeur si le texte est vide
                  return
                }
                setIsEditingText(false)
              }}
              onChange={handleTextChange}
            />
          </div>
        ) : (
          <button
            type="button"
            style={buttonStyle}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
          >
            {designConfig.bouton.text || DEFAULT_BUTTON_CONFIG.text}
          </button>
        )}

        {isActive && !isEditingText && toolbarPosition && (
          <div ref={toolbarRef} onMouseDown={(e) => e.stopPropagation()}>
            <FloatingToolbar
              position={toolbarPosition}
              font={designConfig.bouton.fontFamily}
              fontSize={16}
              color={designConfig.bouton.textColor}
              bold={designConfig.bouton.bold}
              cadreEnabled={designConfig.bouton.hasBackground || designConfig.bouton.border.hasBorder}
              onFontChange={handleFontChange}
              onSizeChange={undefined}
              onBoldToggle={handleBoldToggle}
              onColorClick={handleColorClick}
              onCadreClick={handleCadreClick}
              onClose={handleClose}
            />
          </div>
        )}

        {isActive && sidePanelOpen && toolbarPosition && (
          <div ref={sidePanelRef} onMouseDown={(e) => e.stopPropagation()}>
            <SidePanel
              type={sidePanelType}
              position={toolbarPosition}
              color={sidePanelType === 'color' ? designConfig.bouton.textColor : undefined}
              cadre={sidePanelType === 'cadre' ? {
                enabled: designConfig.bouton.hasBackground,
                backgroundColor: designConfig.bouton.backgroundColor,
                border: {
                  enabled: designConfig.bouton.border.hasBorder,
                  color: designConfig.bouton.border.color,
                  width: designConfig.bouton.border.width
                },
                borderRadius: designConfig.bouton.border.radius,
                shadow: designConfig.bouton.shadow
              } : undefined}
              projectColors={designConfig.projectColors}
              onColorChange={handleColorChange}
              onCadreToggle={handleCadreToggle}
              onCadreChange={handleCadreChange}
              onClose={() => setSidePanelOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
