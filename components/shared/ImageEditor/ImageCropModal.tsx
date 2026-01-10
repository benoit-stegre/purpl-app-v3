// components/shared/ImageEditor/ImageCropModal.tsx
'use client'

import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Cropper, CropperRef, ImageRestriction } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import { X, RotateCcw, Check, Loader2 } from 'lucide-react'
import type { CropModalProps, ImageItem } from './types'

export function ImageCropModal({
  isOpen,
  image,
  onConfirm,
  onCancel
}: CropModalProps) {
  const cropperRef = useRef<CropperRef>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [modalPosition, setModalPosition] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [scale, setScale] = useState(1) // Scale pour adapter les boutons et éléments UI

  // ========== PRÉCHARGEMENT DE L'IMAGE ==========
  // react-advanced-cropper n'a pas de callback onReady/onError
  // On précharge l'image manuellement pour gérer le loading state
  useEffect(() => {
    if (!isOpen) {
      // Reset state quand le modal se ferme
      setIsLoading(true)
      setHasError(false)
      return
    }
    
    setIsLoading(true)
    setHasError(false)
    
    const img = new Image()
    
    img.onload = () => {
      setIsLoading(false)
    }
    
    img.onerror = () => {
      setIsLoading(false)
      setHasError(true)
      console.error('ImageCropModal: Erreur lors du chargement de l\'image:', image.url)
    }
    
    img.src = image.url
    
    // Cleanup pour éviter les memory leaks
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [isOpen, image.url])

  // ✅ Bloquer le scroll du body et rendre les éléments interactifs inertes
  useEffect(() => {
    if (isOpen) {
      // Bloquer le scroll
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      
      // Rendre tous les éléments interactifs en dessous inertes (sauf le modal)
      const allInteractiveElements = document.querySelectorAll(
        'input:not([role="dialog"] input), textarea:not([role="dialog"] textarea), button:not([role="dialog"] button), [contenteditable]:not([role="dialog"] [contenteditable]), [role="textbox"]:not([role="dialog"] [role="textbox"])'
      )
      
      // Sauvegarder et désactiver
      const elementsToRestore: Array<{ element: HTMLElement; hadInert: boolean; ariaHidden: string | null; pointerEvents: string }> = []
      
      allInteractiveElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        // Ne pas rendre inert les éléments du modal
        if (!htmlEl.closest('[role="dialog"]')) {
          elementsToRestore.push({
            element: htmlEl,
            hadInert: htmlEl.hasAttribute('inert'),
            ariaHidden: htmlEl.getAttribute('aria-hidden'),
            pointerEvents: htmlEl.style.pointerEvents || ''
          })
          htmlEl.setAttribute('inert', '')
          htmlEl.setAttribute('aria-hidden', 'true')
          htmlEl.style.pointerEvents = 'none'
        }
      })
      
      // Bloquer aussi les interactions au niveau document avec capture
      const preventInteraction = (e: Event) => {
        const target = e.target as HTMLElement
        if (target && !target.closest('[role="dialog"]')) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation?.()
        }
      }
      
      // Ajouter des listeners en phase de capture pour intercepter avant tout
      document.addEventListener('mousedown', preventInteraction, true)
      document.addEventListener('mouseup', preventInteraction, true)
      document.addEventListener('click', preventInteraction, true)
      document.addEventListener('focusin', preventInteraction, true)
      document.addEventListener('keydown', preventInteraction, true)
      document.addEventListener('input', preventInteraction, true)
      document.addEventListener('touchstart', preventInteraction, true)
      document.addEventListener('touchmove', preventInteraction, true)
      document.addEventListener('touchend', preventInteraction, true)
      
      return () => {
        document.body.style.overflow = originalOverflow
        
        // Restaurer l'état original des éléments
        elementsToRestore.forEach(({ element, hadInert, ariaHidden, pointerEvents }) => {
          if (!hadInert) {
            element.removeAttribute('inert')
          }
          if (ariaHidden === null) {
            element.removeAttribute('aria-hidden')
          } else {
            element.setAttribute('aria-hidden', ariaHidden)
          }
          element.style.pointerEvents = pointerEvents
        })
        
        // Retirer les listeners
        document.removeEventListener('mousedown', preventInteraction, true)
        document.removeEventListener('mouseup', preventInteraction, true)
        document.removeEventListener('click', preventInteraction, true)
        document.removeEventListener('focusin', preventInteraction, true)
        document.removeEventListener('keydown', preventInteraction, true)
        document.removeEventListener('input', preventInteraction, true)
        document.removeEventListener('touchstart', preventInteraction, true)
        document.removeEventListener('touchmove', preventInteraction, true)
        document.removeEventListener('touchend', preventInteraction, true)
      }
    }
  }, [isOpen])

  // ✅ Injecter le style CSS pour surcharger le fond noir du cropper
  useEffect(() => {
    if (isOpen) {
      // Créer un élément style dans le head
      const styleId = 'image-crop-modal-background-override'
      let styleElement = document.getElementById(styleId) as HTMLStyleElement
      
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = styleId
        document.head.appendChild(styleElement)
      }
      
      styleElement.textContent = `
        .image-crop-modal .advanced-cropper {
          background: #ffffff !important;
          background-image: 
            linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
            linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
            linear-gradient(-45deg, transparent 75%, #f3f4f6 75%) !important;
          background-size: 20px 20px !important;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px !important;
        }
      `
      
      return () => {
        // Nettoyer le style quand le modal se ferme
        const style = document.getElementById(styleId)
        if (style) {
          style.remove()
        }
      }
    }
  }, [isOpen])

  // ✅ Calculer la position du modal à GAUCHE de l'avatar (mêmes dimensions)
  useEffect(() => {
    if (isOpen) {
      // Attendre un peu pour que le DOM soit prêt
      const timer = setTimeout(() => {
        // Chercher le conteneur avec transform scale (le vrai avatar)
        let phonePreview = document.querySelector('[style*="transform: scale"]') as HTMLElement
        if (!phonePreview) {
          // Fallback : chercher par width:395px
          phonePreview = document.querySelector('[style*="width: 395px"]') as HTMLElement
        }
        
        if (phonePreview) {
          const phoneRect = phonePreview.getBoundingClientRect()
          // ✅ IMPORTANT : Utiliser les dimensions VISUELLES de l'avatar (après scale)
          // getBoundingClientRect() retourne les dimensions après transformation CSS
          const modalWidth = phoneRect.width
          const modalHeight = phoneRect.height
          
          // Calculer le scale appliqué à l'avatar (dimensions réelles = 395x832)
          const calculatedScale = phoneRect.width / 395
          setScale(calculatedScale)
          
          // Le bord DROIT de la fenêtre doit être à 10px du bord GAUCHE de l'avatar
          // Donc left = phoneRect.left - modalWidth - 10
          const left = phoneRect.left - modalWidth - 10
          
          // Centrer verticalement : le centre vertical de la fenêtre = centre vertical de l'avatar
          // Centre vertical de l'avatar = phoneRect.top + phoneRect.height / 2
          // Centre vertical de la fenêtre = top + modalHeight / 2
          // Donc top = phoneRect.top + phoneRect.height / 2 - modalHeight / 2
          const avatarCenterY = phoneRect.top + phoneRect.height / 2
          const top = avatarCenterY - modalHeight / 2
          
          console.log('📐 Position modal:', {
            phoneRect: { 
              left: phoneRect.left, 
              top: phoneRect.top, 
              width: phoneRect.width,  // Dimensions visuelles après scale
              height: phoneRect.height, // Dimensions visuelles après scale
              right: phoneRect.right,
              bottom: phoneRect.bottom
            },
            modal: { 
              left, 
              top, 
              width: modalWidth,  // Même taille que l'avatar visuel
              height: modalHeight, // Même taille que l'avatar visuel
              right: left + modalWidth,
              bottom: top + modalHeight
            },
            avatarCenterY,
            modalCenterY: top + modalHeight / 2,
            windowHeight: window.innerHeight,
            scale: calculatedScale // Scale pour adapter les boutons
          })
          
          setModalPosition({
            left: left,
            top: top,
            width: modalWidth,
            height: modalHeight
          })
        } else {
          console.warn('ImageCropModal: Avatar non trouvé')
          // Fallback : centré à gauche de l'écran avec dimensions par défaut
          // On utilise les dimensions réelles par défaut si l'avatar n'est pas trouvé
          const fallbackWidth = 395
          const fallbackHeight = 832
          setModalPosition({
            left: 20,
            top: (window.innerHeight - fallbackHeight) / 2,
            width: fallbackWidth,
            height: fallbackHeight
          })
        }
      }, 100)
      
      return () => {
        clearTimeout(timer)
        setModalPosition(null)
      }
    }
  }, [isOpen])

  // Convertir notre format crop vers le format react-advanced-cropper
  const defaultCoordinates = useMemo(() => {
    // Si resetKey > 0, on force la réinitialisation à l'image entière
    if (resetKey > 0) {
      return {
        left: 0,
        top: 0,
        width: image.sourceWidth,
        height: image.sourceHeight
      }
    }
    return {
      left: image.crop.x,
      top: image.crop.y,
      width: image.crop.width,
      height: image.crop.height
    }
  }, [image.crop.x, image.crop.y, image.crop.width, image.crop.height, image.sourceWidth, image.sourceHeight, resetKey])

  // Reset : remet la zone de sélection à l'image entière (SANS fermer le modal)
  const handleReset = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
      if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
        e.nativeEvent.stopImmediatePropagation()
      }
    }
    
    // Méthode 1 : Forcer le re-render avec resetKey
    setResetKey(prev => prev + 1)
    
    // Méthode 2 : Essayer aussi avec l'API du cropper si disponible
    if (cropperRef.current) {
      try {
        // Méthode recommandée : Utiliser getDefaultState puis setState
        const defaultState = cropperRef.current.getDefaultState?.()
        if (defaultState && cropperRef.current.setState) {
          cropperRef.current.setState(defaultState)
        }
      } catch (error) {
        // Ignorer l'erreur, on utilise resetKey comme fallback
      }

      try {
        // Méthode alternative : Utiliser setCoordinates directement
        if (cropperRef.current.setCoordinates) {
          cropperRef.current.setCoordinates({
            left: 0,
            top: 0,
            width: image.sourceWidth,
            height: image.sourceHeight
          })
        }
      } catch (error) {
        // Ignorer l'erreur, on utilise resetKey comme fallback
      }
    }
  }, [image.sourceWidth, image.sourceHeight])

  // Validation : récupère les coordonnées et ferme le modal
  const handleConfirm = useCallback(() => {
    const coords = cropperRef.current?.getCoordinates()
    
    if (!coords) {
      console.error('ImageCropModal: Impossible de récupérer les coordonnées du crop')
      // En cas d'erreur, fermer avec le crop actuel (fallback sécurisé)
      onConfirm(image.crop)
      return
    }
    
    // Convertir le format react-advanced-cropper vers notre format
    const newCrop: ImageItem['crop'] = {
      x: Math.round(coords.left),
      y: Math.round(coords.top),
      width: Math.round(coords.width),
      height: Math.round(coords.height)
    }
    
    onConfirm(newCrop)
  }, [onConfirm, image.crop])

  // Gestion de l'annulation
  const handleCancel = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    onCancel()
  }, [onCancel])

  // Fermeture avec touche Escape ou validation avec Ctrl+Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel(e)
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      e.stopPropagation()
      handleConfirm()
    }
  }, [handleCancel, handleConfirm])

  // Ne pas rendre si le modal est fermé
  if (!isOpen || !modalPosition) return null

  // Utiliser un portal pour placer le modal au niveau racine du DOM
  const modalContent = (
    <>
      {/* Overlay sombre qui bloque toutes les interactions */}
      <div 
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: 10001 }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleCancel()
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseMove={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onKeyDown={(e) => {
          // Laisser passer seulement Escape pour fermer le modal
          if (e.key !== 'Escape') {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        onKeyUp={(e) => {
          if (e.key !== 'Escape') {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        onFocus={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onBlur={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
          touchAction: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        tabIndex={-1}
      />
      
      {/* Modal positionné à gauche de l'avatar */}
      <div 
        className="fixed bg-gray-900 flex flex-col rounded-lg shadow-2xl border border-gray-700 image-crop-modal"
        style={{
          zIndex: 10002,
          left: `${modalPosition.left}px`,
          top: `${modalPosition.top}px`,
          width: `${modalPosition.width}px`,
          height: `${modalPosition.height}px`,
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
      {/* Bouton fermer en haut à droite */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('❌ Fermer (X) cliqué')
          handleCancel(e)
        }}
        className="absolute text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800 z-[100] bg-gray-900/80"
        style={{
          top: `${16 * scale}px`,
          right: `${16 * scale}px`,
          padding: `${8 * scale}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top right'
        }}
        aria-label="Fermer"
        type="button"
      >
        <X style={{ width: `${24 * scale}px`, height: `${24 * scale}px` }} />
      </button>

      {/* Zone du Cropper */}
      <div 
        className="flex-1 relative"
        style={{
          // Pattern en damier pour voir les images noires ET blanches
          backgroundImage: `
            linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
            linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
            linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#ffffff' // Fond blanc par défaut
        }}
      >
        {/* Indicateur de chargement */}
        {isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{
              backgroundColor: '#ffffff',
              backgroundImage: `
                linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
                linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
                linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          >
            <div className="flex flex-col items-center" style={{ gap: `${12 * scale}px` }}>
              <Loader2 className="text-purple-500 animate-spin" style={{ width: `${40 * scale}px`, height: `${40 * scale}px` }} />
              <span className="text-gray-400" style={{ fontSize: `${14 * scale}px` }}>Chargement de l'image...</span>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {hasError && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{
              backgroundColor: '#ffffff',
              backgroundImage: `
                linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
                linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
                linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          >
            <div className="flex flex-col items-center text-center" style={{ gap: `${12 * scale}px`, padding: `${16 * scale}px` }}>
              <div className="rounded-full bg-red-500/20 flex items-center justify-center" style={{ width: `${64 * scale}px`, height: `${64 * scale}px` }}>
                <X className="text-red-500" style={{ width: `${32 * scale}px`, height: `${32 * scale}px` }} />
              </div>
              <p className="text-white font-medium" style={{ fontSize: `${16 * scale}px` }}>Impossible de charger l'image</p>
              <p className="text-gray-400" style={{ fontSize: `${14 * scale}px` }}>Vérifiez que l'image existe et réessayez</p>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleCancel(e)
                }}
                className="bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                style={{
                  marginTop: `${8 * scale}px`,
                  padding: `${8 * scale}px ${16 * scale}px`,
                  fontSize: `${14 * scale}px`
                }}
                type="button"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Cropper - Affiché seulement quand l'image est chargée et sans erreur */}
        {!isLoading && !hasError && (
          <Cropper
            key={`cropper-${resetKey}`}
            ref={cropperRef}
            src={image.url}
            defaultCoordinates={defaultCoordinates}
            className="h-full"
            imageRestriction={ImageRestriction.stencil}
            stencilProps={{
              movable: true,
              resizable: true,
              lines: true,
              handlers: true
            }}
          />
        )}
      </div>

      {/* Footer avec boutons */}
      <div 
        className="flex items-center justify-between bg-gray-900 border-t border-gray-700 relative z-50"
        style={{
          padding: `${16 * scale}px`,
          borderTopWidth: `${1 * scale}px`
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
            e.nativeEvent.stopImmediatePropagation()
          }
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
            e.nativeEvent.stopImmediatePropagation()
          }
        }}
        onMouseUp={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
            e.nativeEvent.stopImmediatePropagation()
          }
        }}
      >
        {/* Bouton Reset */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
              e.nativeEvent.stopImmediatePropagation()
            }
            console.log('🔄 Reset cliqué')
            handleReset(e)
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
              e.nativeEvent.stopImmediatePropagation()
            }
          }}
          onMouseUp={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
              e.nativeEvent.stopImmediatePropagation()
            }
          }}
          className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-50"
          style={{
            gap: `${8 * scale}px`,
            padding: `${8 * scale}px ${16 * scale}px`,
            fontSize: `${14 * scale}px`
          }}
          disabled={hasError || isLoading}
          type="button"
        >
          <RotateCcw style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} />
          <span className="hidden sm:inline">Réinitialiser</span>
        </button>

        {/* Boutons Annuler / Valider */}
        <div className="flex items-center" style={{ gap: `${12 * scale}px` }}>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('❌ Annuler cliqué')
              handleCancel(e)
            }}
            className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative z-50"
            style={{
              padding: `${8 * scale}px ${24 * scale}px`,
              fontSize: `${14 * scale}px`
            }}
            type="button"
          >
            Annuler
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('✅ Valider cliqué')
              handleConfirm()
            }}
            className="flex items-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-50"
            style={{
              gap: `${8 * scale}px`,
              padding: `${8 * scale}px ${24 * scale}px`,
              fontSize: `${14 * scale}px`
            }}
            disabled={hasError || isLoading}
            type="button"
          >
            <Check style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} />
            <span>Valider</span>
          </button>
        </div>
      </div>
    </div>
    </>
  )

  // Utiliser createPortal pour placer le modal au niveau racine du DOM
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  
  return null
}

