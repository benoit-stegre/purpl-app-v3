'use client'

import PhotoItem from './PhotoItem'
import { useState, useEffect, useRef } from 'react'
import { PhotoItem as PhotoItemType } from '@/types/design-v6'

interface PhotoItemWithCropProps {
  photo: PhotoItemType
  isActive: boolean
  maxWidth: number
  onResize: (width: number, height: number) => void
  onCropSave: (photo: PhotoItemType) => void
  onClick?: () => void
  onDoubleClick?: () => void
  onDelete?: () => void
}

export default function PhotoItemWithCrop({
  photo,
  isActive,
  maxWidth,
  onResize,
  onCropSave,
  onClick,
  onDoubleClick,
  onDelete
}: PhotoItemWithCropProps) {
  const [isCropMode, setIsCropMode] = useState(false)
  const [tempCrop, setTempCrop] = useState(
    photo?.crop || { x: 0, y: 0, width: photo?.sourceWidth || 0, height: photo?.sourceHeight || 0 }
  )
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  const tempCropRef = useRef(tempCrop)
  const onCropSaveRef = useRef(onCropSave)
  
  // ✅ FIX BUG BLANCS: Calcul selon modèle Canva
  // Le container doit TOUJOURS avoir les proportions exactes du crop
  // displayWidth/displayHeight peuvent avoir des arrondis qui ne correspondent pas exactement au crop
  const effectiveWidth = Math.min(photo.displayWidth, maxWidth)
  
  // ✅ CRITIQUE: TOUJOURS utiliser les proportions du crop pour calculer effectiveHeight
  // Car le container affiche le crop, donc il doit avoir les proportions du crop
  // Ne JAMAIS utiliser displayAspectRatio qui peut avoir des arrondis
  // IMPORTANT: Utiliser les dimensions EXACTES du crop, pas celles sauvegardées (qui peuvent avoir des arrondis)
  let effectiveHeight: number
  if (photo.crop) {
    // Utiliser les proportions exactes du crop pour garantir la cohérence
    const cropAspectRatio = photo.crop.width / photo.crop.height
    // Calculer effectiveHeight à partir de effectiveWidth et cropAspectRatio
    // Utiliser Math.round pour éviter les problèmes d'affichage avec des valeurs décimales
    effectiveHeight = Math.round(effectiveWidth / cropAspectRatio)
    
    // 🔍 DEBUG: Vérifier la cohérence
    const expectedDisplayHeight = Math.round(photo.displayWidth / cropAspectRatio)
    if (Math.abs(effectiveHeight - expectedDisplayHeight) > 1) {
      console.warn('⚠️ Incohérence effectiveHeight:', {
        effectiveHeight,
        expectedDisplayHeight,
        displayWidth: photo.displayWidth,
        displayHeight: photo.displayHeight,
        cropAspectRatio: cropAspectRatio.toFixed(4)
      })
    }
  } else {
    // Pas de crop : utiliser displayHeight
    effectiveHeight = photo.displayHeight
  }
  
  // ✅ CRITIQUE: Utiliser des refs pour garantir que effectiveWidth/Height sont toujours à jour dans les callbacks
  const effectiveWidthRef = useRef(effectiveWidth)
  const effectiveHeightRef = useRef(effectiveHeight)
  
  useEffect(() => {
    effectiveWidthRef.current = effectiveWidth
    effectiveHeightRef.current = effectiveHeight
  }, [effectiveWidth, effectiveHeight])
  
  useEffect(() => {
    tempCropRef.current = tempCrop
    onCropSaveRef.current = onCropSave
  })

  const handleDoubleClick = () => {
    console.log('🔵 Activation mode CROP')
    setIsCropMode(true)
    setTempCrop(photo.crop || { x: 0, y: 0, width: photo.sourceWidth, height: photo.sourceHeight })
  }

  useEffect(() => {
    if (!isCropMode) return

    console.log('🔵 Installation listeners crop mode')

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      if (target.classList.contains('crop-handle')) {
        console.log('🔵 Clic sur poignée, ignoré')
        return
      }
      
      if (!containerRef.current?.contains(target)) {
        console.log('💾 Sauvegarde crop et sortie mode')
        
        const cropChanged = !photo.crop || 
          photo.crop.x !== tempCropRef.current.x ||
          photo.crop.y !== tempCropRef.current.y ||
          photo.crop.width !== tempCropRef.current.width ||
          photo.crop.height !== tempCropRef.current.height
        
        if (cropChanged) {
          console.log('✅ Crop modifié, recalcul dimensions')
          
          // ✅ FIX: Utiliser le ratio du crop actuel, pas le ratio global de l'image
          // Le container actuel a une taille effectiveWidth qui affiche photo.crop.width
          // On calcule le ratio: combien de pixels display pour 1 pixel source du crop
          const currentEffectiveWidth = effectiveWidthRef.current
          const currentCropDisplayRatio = currentEffectiveWidth / photo.crop.width
          
          // Calculer les nouvelles dimensions display en appliquant ce ratio au nouveau crop
          let newDisplayWidth = tempCropRef.current.width * currentCropDisplayRatio
          let newDisplayHeight = tempCropRef.current.height * currentCropDisplayRatio
          
          // Limiter à maxWidth si nécessaire
          if (newDisplayWidth > maxWidth) {
            const scale = maxWidth / newDisplayWidth
            newDisplayWidth = maxWidth
            newDisplayHeight = newDisplayHeight * scale
          }
          
          // Arrondir uniquement à la fin
          newDisplayWidth = Math.round(newDisplayWidth)
          newDisplayHeight = Math.round(newDisplayHeight)
          
          console.log('📐 Nouvelles dimensions display:', {
            oldCrop: `w:${photo.crop.width} h:${photo.crop.height}`,
            newCrop: `w:${tempCropRef.current.width} h:${tempCropRef.current.height}`,
            currentCropDisplayRatio: currentCropDisplayRatio.toFixed(4),
            newDisplayWidth,
            newDisplayHeight
          })
          
          onCropSaveRef.current({
            ...photo,
            crop: tempCropRef.current,
            displayWidth: newDisplayWidth,
            displayHeight: newDisplayHeight
          })
        } else {
          console.log('⏭️ Crop identique, pas de changement')
          onCropSaveRef.current({
            ...photo,
            crop: tempCropRef.current
          })
        }
        
        setIsCropMode(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('❌ Annulation crop (Escape)')
        setIsCropMode(false)
        setTempCrop(photo.crop || { x: 0, y: 0, width: photo.sourceWidth, height: photo.sourceHeight })
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true)
    document.addEventListener('keydown', handleEscape)

    return () => {
      console.log('🔴 Nettoyage listeners crop mode')
      document.removeEventListener('mousedown', handleClickOutside, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isCropMode, photo])

  const handleCropSideMouseDown = (side: 'top' | 'right' | 'bottom' | 'left', e: React.MouseEvent) => {
    console.log('🟢 POIGNÉE CLIQUÉE:', side)
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const startCrop = { ...tempCrop }

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      // ✅ FIX: Utiliser le ratio du crop, pas le ratio global de l'image
      // Le container affiche la zone crop, donc on convertit les pixels display en pixels source
      // en utilisant le ratio crop.width/effectiveWidth (et crop.height/effectiveHeight)
      const currentEffectiveWidth = effectiveWidthRef.current
      const currentEffectiveHeight = effectiveHeightRef.current
      
      const scaleX = photo.crop.width / currentEffectiveWidth
      const scaleY = photo.crop.height / currentEffectiveHeight

      const deltaSourceX = deltaX * scaleX
      const deltaSourceY = deltaY * scaleY

      let newCrop = { ...startCrop }

      switch (side) {
        case 'top':
          newCrop.y = Math.max(0, Math.min(startCrop.y + deltaSourceY, photo.sourceHeight - 50))
          newCrop.height = Math.max(50, startCrop.height - deltaSourceY)
          break
        case 'right':
          newCrop.width = Math.max(50, Math.min(startCrop.width + deltaSourceX, photo.sourceWidth - startCrop.x))
          break
        case 'bottom':
          newCrop.height = Math.max(50, Math.min(startCrop.height + deltaSourceY, photo.sourceHeight - startCrop.y))
          break
        case 'left':
          newCrop.x = Math.max(0, Math.min(startCrop.x + deltaSourceX, photo.sourceWidth - 50))
          newCrop.width = Math.max(50, startCrop.width - deltaSourceX)
          break
      }

      setTempCrop(newCrop)
    }

    const handleMouseUp = () => {
      console.log('🟢 POIGNÉE RELÂCHÉE:', side)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleResetImage = () => {
    console.log('🔄 Reset image à taille originale');
    
    // Remettre le crop à l'image complète
    const resetCrop = {
      x: 0,
      y: 0,
      width: photo.sourceWidth,
      height: photo.sourceHeight
    };
    
    // Calculer les nouvelles dimensions display depuis source avec maxWidth (comme au téléchargement)
    const aspectRatio = photo.sourceWidth / photo.sourceHeight;
    let newDisplayWidth = photo.sourceWidth;
    let newDisplayHeight = photo.sourceHeight;
    
    if (newDisplayWidth > maxWidth) {
      newDisplayWidth = maxWidth;
      newDisplayHeight = Math.round(newDisplayWidth / aspectRatio);
    }
    
    // Sauvegarder immédiatement
    onCropSaveRef.current({
      ...photo,
      crop: resetCrop,
      displayWidth: newDisplayWidth,
      displayHeight: newDisplayHeight
    });
  };

  console.log('🔍 PhotoItemWithCrop render:', { 
    photoId: photo.id,
    isActive, 
    isCropMode, 
    finalIsActive: isActive && !isCropMode 
  })
  
  return (
    <div 
      ref={containerRef} 
      className="relative inline-block"
      style={{
        width: Math.round(effectiveWidth) + 'px',
        height: Math.round(effectiveHeight) + 'px'
      }}
    >
      <PhotoItem
        photo={photo}
        isActive={isActive && !isCropMode}
        maxWidth={maxWidth}
        onResize={onResize}
        onDoubleClick={handleDoubleClick}
        onClick={() => {
          console.log('👆 CLICK dans PhotoItemWithCrop')
          if (onClick) {
            onClick()
          }
        }}
        isEditingCrop={isCropMode}
        onReset={handleResetImage}
        onDelete={onDelete}
      />

      {isCropMode && (
        <div 
          className="fixed inset-0 z-30 bg-transparent cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            console.log('💾 OVERLAY: Clic extérieur détecté, sauvegarde crop')
            
            const cropChanged = !photo.crop || 
              photo.crop.x !== tempCropRef.current.x ||
              photo.crop.y !== tempCropRef.current.y ||
              photo.crop.width !== tempCropRef.current.width ||
              photo.crop.height !== tempCropRef.current.height
            
            if (cropChanged) {
              console.log('✅ Crop modifié, recalcul dimensions (OVERLAY)')
              
              // ✅ FIX: Utiliser le ratio du crop actuel, pas le ratio global de l'image
              const currentEffectiveWidth = effectiveWidthRef.current
              const currentCropDisplayRatio = currentEffectiveWidth / photo.crop.width
              
              // Calculer les nouvelles dimensions display
              let newDisplayWidth = tempCropRef.current.width * currentCropDisplayRatio
              let newDisplayHeight = tempCropRef.current.height * currentCropDisplayRatio
              
              // Limiter à maxWidth si nécessaire
              if (newDisplayWidth > maxWidth) {
                const scale = maxWidth / newDisplayWidth
                newDisplayWidth = maxWidth
                newDisplayHeight = newDisplayHeight * scale
              }
              
              // Arrondir uniquement à la fin
              newDisplayWidth = Math.round(newDisplayWidth)
              newDisplayHeight = Math.round(newDisplayHeight)
              
              console.log('📐 OVERLAY: Nouvelles dimensions display:', {
                oldCrop: `w:${photo.crop.width} h:${photo.crop.height}`,
                newCrop: `w:${tempCropRef.current.width} h:${tempCropRef.current.height}`,
                currentCropDisplayRatio: currentCropDisplayRatio.toFixed(4),
                newDisplayWidth,
                newDisplayHeight
              })
              
              onCropSaveRef.current({
                ...photo,
                crop: tempCropRef.current,
                displayWidth: newDisplayWidth,
                displayHeight: newDisplayHeight
              })
            } else {
              console.log('⏭️ Crop identique, pas de changement')
              onCropSaveRef.current({
                ...photo,
                crop: tempCropRef.current
              })
            }
            
            setIsCropMode(false)
          }}
        />
      )}

      {isCropMode && (() => {
        // ✅ FIX: Utiliser effectiveWidth/effectiveHeight au lieu de displayWidth/displayHeight
        // Car le container a les dimensions effectiveWidth x effectiveHeight qui correspondent exactement au crop
        const currentEffectiveWidth = effectiveWidthRef.current
        const currentEffectiveHeight = effectiveHeightRef.current
        
        // Calculer les facteurs d'échelle pour convertir pixels source en pixels display
        const scaleX = currentEffectiveWidth / photo.crop.width
        const scaleY = currentEffectiveHeight / photo.crop.height
        
        // Calculer les positions en pourcentage pour l'overlay
        const cropLeft = (tempCrop.x * scaleX / currentEffectiveWidth) * 100
        const cropTop = (tempCrop.y * scaleY / currentEffectiveHeight) * 100
        const cropRight = ((tempCrop.x + tempCrop.width) * scaleX / currentEffectiveWidth) * 100
        const cropBottom = ((tempCrop.y + tempCrop.height) * scaleY / currentEffectiveHeight) * 100
        
        return (
          <>
            <div
              className="absolute inset-0 pointer-events-none z-40"
              style={{
                background: `linear-gradient(
                  to bottom,
                  rgba(0,0,0,0.5) 0%,
                  rgba(0,0,0,0.5) ${cropTop}%,
                  transparent ${cropTop}%,
                  transparent ${cropBottom}%,
                  rgba(0,0,0,0.5) ${cropBottom}%,
                  rgba(0,0,0,0.5) 100%
                ),
                linear-gradient(
                  to right,
                  rgba(0,0,0,0.5) 0%,
                  rgba(0,0,0,0.5) ${cropLeft}%,
                  transparent ${cropLeft}%,
                  transparent ${cropRight}%,
                  rgba(0,0,0,0.5) ${cropRight}%,
                  rgba(0,0,0,0.5) 100%
                )`
              }}
            />
            
            <div
              className="crop-handle absolute h-1 bg-blue-500 cursor-ns-resize hover:bg-blue-600 rounded-full z-50"
              style={{ 
                top: `${cropTop}%`,
                left: `${(cropLeft + cropRight) / 2}%`,
                width: '60px',
                transform: 'translate(-50%, -50%)'
              }}
              onMouseDown={(e) => handleCropSideMouseDown('top', e)}
            />

            <div
              className="crop-handle absolute w-1 bg-blue-500 cursor-ew-resize hover:bg-blue-600 rounded-full z-50"
              style={{ 
                right: `${100 - cropRight}%`,
                top: `${(cropTop + cropBottom) / 2}%`,
                height: '60px',
                transform: 'translate(50%, -50%)'
              }}
              onMouseDown={(e) => handleCropSideMouseDown('right', e)}
            />

            <div
              className="crop-handle absolute h-1 bg-blue-500 cursor-ns-resize hover:bg-blue-600 rounded-full z-50"
              style={{ 
                bottom: `${100 - cropBottom}%`,
                left: `${(cropLeft + cropRight) / 2}%`,
                width: '60px',
                transform: 'translate(-50%, 50%)'
              }}
              onMouseDown={(e) => handleCropSideMouseDown('bottom', e)}
            />

            <div
              className="crop-handle absolute w-1 bg-blue-500 cursor-ew-resize hover:bg-blue-600 rounded-full z-50"
              style={{ 
                left: `${cropLeft}%`,
                top: `${(cropTop + cropBottom) / 2}%`,
                height: '60px',
                transform: 'translate(-50%, -50%)'
              }}
              onMouseDown={(e) => handleCropSideMouseDown('left', e)}
            />

          </>
        )
      })()}
    </div>
  )
}