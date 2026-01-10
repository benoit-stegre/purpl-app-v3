'use client';
import LogoItem from './LogoItem'
import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createInitialLogoItem } from '@/lib/utils/image-logo';

interface LogoItemWithCropProps {
  logo: any;
  isActive: boolean;
  maxWidth: number;
  onResize: (width: number, height: number) => void;
  onCropSave: (cropData: any) => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onDelete?: () => void;
  onReset?: () => void;
  showResizeHandles?: boolean;
}

export default function LogoItemWithCrop({
  logo,
  isActive,
  maxWidth,
  onResize,
  onCropSave,
  onClick,
  onDoubleClick,
  onDelete,
  onReset: externalOnReset,
  showResizeHandles = true
}: LogoItemWithCropProps) {
  const [uploading, setUploading] = useState(false);
  const [isLoadingDimensions, setIsLoadingDimensions] = useState(false);
  
  const [isCropMode, setIsCropMode] = useState(false);
  const [tempCrop, setTempCrop] = useState(
    logo?.crop || { x: 0, y: 0, width: logo?.sourceWidth || 0, height: logo?.sourceHeight || 0 }
  );
  
  // ✅ FIX: Mettre à jour tempCrop quand logo.crop change (réouverture après sauvegarde)
  useEffect(() => {
    if (logo?.crop && !isCropMode) {
      setTempCrop(logo.crop);
    }
  }, [logo?.crop, isCropMode]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ✅ FIX: Refs pour éviter les re-renders constants
  const tempCropRef = useRef(tempCrop);
  const onCropSaveRef = useRef(onCropSave);
  
  // ✅ Mise à jour des refs à chaque render
  useEffect(() => {
    tempCropRef.current = tempCrop;
    onCropSaveRef.current = onCropSave;
  });
  
  const supabase = createClient();

  useEffect(() => {
    const shouldLoadDimensions = 
      logo?.url && 
      (logo.displayWidth === 0 || logo.displayHeight === 0 || !logo.displayWidth);
    
    if (shouldLoadDimensions && !isLoadingDimensions) {
      setIsLoadingDimensions(true);
      
      createInitialLogoItem(logo.url, maxWidth, logo.order || 0)
        .then((logoItem) => {
          if (onCropSave) {
            onCropSave(logoItem);
          }
          if (onResize) {
            onResize(logoItem.displayWidth, logoItem.displayHeight);
          }
          setIsLoadingDimensions(false);
        })
        .catch((err) => {
          console.error('Erreur chargement dimensions:', err);
          setIsLoadingDimensions(false);
        });
    }
  }, [logo?.url, logo?.displayWidth, logo?.displayHeight, maxWidth, isLoadingDimensions]);

  const handleDoubleClick = () => {
    setIsCropMode(true);
    setTempCrop(logo.crop || { x: 0, y: 0, width: logo.sourceWidth, height: logo.sourceHeight });
  };

  // ✅ FIX: Listener qui utilise les refs (pas de dépendances tempCrop/onCropSave)
  useEffect(() => {
    if (!isCropMode) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ignorer si clic sur poignée de crop
      if (target.classList.contains('crop-handle')) {
        return;
      }
      
      // Vérifier si clic en dehors du container
      if (!containerRef.current?.contains(target)) {
        // 🎯 VÉRIFIER SI LE CROP A CHANGÉ
        const cropChanged = !logo.crop || 
          logo.crop.x !== tempCropRef.current.x ||
          logo.crop.y !== tempCropRef.current.y ||
          logo.crop.width !== tempCropRef.current.width ||
          logo.crop.height !== tempCropRef.current.height;
        
        if (cropChanged) {
          // ✅ FIX BUG BLANCS: Calcul selon modèle Canva
          // Le principe : le container affiche le crop, donc displayWidth/displayHeight doivent
          // correspondre EXACTEMENT aux proportions du crop (limitées par maxWidth)
          
          const newCropAspectRatio = tempCropRef.current.width / tempCropRef.current.height;
          
          // Calculer l'échelle actuelle : combien de pixels display pour 1 pixel source du crop
          // On utilise effectiveWidth qui est la taille réelle du container affiché
          // et logo.crop.width qui est l'ancien crop (pour préserver l'échelle visuelle)
          const currentCropDisplayRatio = effectiveWidth / logo.crop.width;
          
          // Calculer les nouvelles dimensions display en préservant l'échelle visuelle
          let newDisplayWidth = Math.round(tempCropRef.current.width * currentCropDisplayRatio);
          let newDisplayHeight = Math.round(tempCropRef.current.height * currentCropDisplayRatio);
          
          // ✅ CRITIQUE: Garantir que les proportions correspondent EXACTEMENT au crop
          // Recalculer à partir de l'aspect ratio exact du crop pour éviter les arrondis
          if (newDisplayWidth > maxWidth) {
            newDisplayWidth = maxWidth;
          }
          newDisplayHeight = Math.round(newDisplayWidth / newCropAspectRatio);
          
          onCropSaveRef.current({
            ...logo,
            crop: tempCropRef.current,
            displayWidth: newDisplayWidth,
            displayHeight: newDisplayHeight
          });
        } else {
          onCropSaveRef.current({
            ...logo,
            crop: tempCropRef.current
          });
        }
        
        setIsCropMode(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCropMode(false);
        setTempCrop(logo.crop || { x: 0, y: 0, width: logo.sourceWidth, height: logo.sourceHeight });
      }
    };

    // mousedown + capture phase
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isCropMode, logo]); // ✅ Plus de tempCrop ou onCropSave dans les deps

  const handleResetImage = () => {
    // Remettre le crop à l'image complète
    const resetCrop = {
      x: 0,
      y: 0,
      width: logo.sourceWidth,
      height: logo.sourceHeight
    };
    
    // Calculer les nouvelles dimensions display depuis source avec maxWidth (comme au téléchargement)
    const aspectRatio = logo.sourceWidth / logo.sourceHeight;
    let newDisplayWidth = logo.sourceWidth;
    let newDisplayHeight = logo.sourceHeight;
    
    if (newDisplayWidth > maxWidth) {
      newDisplayWidth = maxWidth;
      newDisplayHeight = Math.round(newDisplayWidth / aspectRatio);
    }
    
    const resetLogo = {
      ...logo,
      crop: resetCrop,
      displayWidth: newDisplayWidth,
      displayHeight: newDisplayHeight
    };
    
    // Sauvegarder immédiatement
    onCropSaveRef.current(resetLogo);
  };

  // ✅ FIX BUG BLANCS: Calcul selon modèle Canva
  // Le container doit TOUJOURS avoir les proportions exactes du crop
  // displayWidth/displayHeight peuvent avoir des arrondis qui ne correspondent pas exactement au crop
  
  // Utiliser tempCrop en mode crop, sinon logo.crop
  const activeCrop = isCropMode && tempCrop ? tempCrop : logo.crop

  // Recalculer l'échelle depuis tempCrop en mode crop
  const displayScale = isCropMode && tempCrop 
    ? maxWidth / tempCrop.width  // ✅ Échelle recalculée en temps réel
    : logo.displayWidth / logo.sourceWidth

  // Container dimensions
  const containerWidth = isCropMode && tempCrop
    ? Math.min(tempCrop.width * displayScale, maxWidth)  // ✅ Max 309px
    : Math.min(logo.displayWidth, maxWidth)

  const cropAspectRatio = activeCrop 
    ? activeCrop.width / activeCrop.height 
    : logo.sourceWidth / logo.sourceHeight

  const containerHeight = Math.round(containerWidth / cropAspectRatio)

  // Utiliser containerWidth/Height au lieu de effectiveWidth/Height
  const effectiveWidth = containerWidth
  const effectiveHeight = containerHeight

  const handleCropSideMouseDown = (side: 'top' | 'right' | 'bottom' | 'left', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...tempCrop };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // ✅ FIX BUG 1: Facteurs d'échelle basés sur le CROP, pas sur l'image source complète
      // Le container affiche la zone crop, donc on convertit les pixels display en pixels source
      // en utilisant le ratio crop.width/effectiveWidth (et crop.height/effectiveHeight)
      const scaleX = logo.crop.width / effectiveWidth;
      const scaleY = logo.crop.height / effectiveHeight;

      const deltaSourceX = deltaX * scaleX;
      const deltaSourceY = deltaY * scaleY;

      let newCrop = { ...startCrop };

      switch (side) {
        case 'top':
          newCrop.y = Math.max(0, Math.min(startCrop.y + deltaSourceY, logo.sourceHeight - 50));
          newCrop.height = Math.max(50, startCrop.height - deltaSourceY);
          break;
        case 'right':
          newCrop.width = Math.max(50, Math.min(startCrop.width + deltaSourceX, logo.sourceWidth - startCrop.x));
          break;
        case 'bottom':
          newCrop.height = Math.max(50, Math.min(startCrop.height + deltaSourceY, logo.sourceHeight - startCrop.y));
          break;
        case 'left':
          newCrop.x = Math.max(0, Math.min(startCrop.x + deltaSourceX, logo.sourceWidth - 50));
          newCrop.width = Math.max(50, startCrop.width - deltaSourceX);
          break;
      }

      setTempCrop(newCrop);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${timestamp}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(fileName);

      const logoItem = await createInitialLogoItem(publicUrl, maxWidth, 0);

      if (onCropSave) {
        onCropSave(logoItem);
      }
      
      if (onResize) {
        onResize(logoItem.displayWidth, logoItem.displayHeight);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur upload: ' + (error as any).message);
    } finally {
      setUploading(false);
    }
  };

  if (!logo?.url) {
    return (
      <div 
        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg" 
        style={{ width: maxWidth, height: 200 }}
      >
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <label 
          htmlFor="logo-upload" 
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer inline-block"
        >
          {uploading ? 'Upload...' : 'Ajouter un logo'}
        </label>
        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>
    );
  }

  if (isLoadingDimensions) {
    return (
      <div 
        className="flex items-center justify-center p-8 border border-gray-300 rounded-lg bg-gray-50" 
        style={{ width: maxWidth, height: 100 }}
      >
        <div className="text-gray-500 text-sm">Chargement dimensions...</div>
      </div>
    );
  }

  
  
  return (
    <div 
      ref={containerRef} 
      className="relative inline-block"
      style={{
        width: effectiveWidth + 'px',  // ✅ Utiliser effectiveWidth au lieu de displayWidth
        height: effectiveHeight + 'px', // ✅ Utiliser effectiveHeight au lieu de displayHeight
      }}
    >
      <LogoItem
        logo={{
          ...logo,
          crop: isCropMode && tempCrop ? tempCrop : logo.crop,  // ✅ Utiliser tempCrop en mode crop
          displayWidth: containerWidth,   // ✅ Dimensions recalculées
          displayHeight: containerHeight
        }}
        isActive={isActive}
        maxWidth={maxWidth}
        onResize={onResize}
        onDoubleClick={handleDoubleClick}
        onClick={onClick ? onClick : () => {}}
        isEditingCrop={isCropMode} // Les poignées de resize sont visibles quand isActive && !isEditingCrop
        onReset={externalOnReset || handleResetImage}
        onDelete={onDelete}
      />

      
      {/* 🎯 OVERLAY TRANSPARENT - Détection clic extérieur */}
      {isCropMode && (
        <div 
          className="fixed inset-0 z-30 bg-transparent cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            
            // 🎯 VÉRIFIER SI LE CROP A CHANGÉ
            const cropChanged = !logo.crop || 
              logo.crop.x !== tempCropRef.current.x ||
              logo.crop.y !== tempCropRef.current.y ||
              logo.crop.width !== tempCropRef.current.width ||
              logo.crop.height !== tempCropRef.current.height;
            
            if (cropChanged) {
              // ✅ FIX BUG BLANCS: Calcul selon modèle Canva
              // Le principe : le container affiche le crop, donc displayWidth/displayHeight doivent
              // correspondre EXACTEMENT aux proportions du crop (limitées par maxWidth)
              
              const newCropAspectRatio = tempCropRef.current.width / tempCropRef.current.height;
              
              // Calculer l'échelle actuelle : combien de pixels display pour 1 pixel source du crop
              // On utilise effectiveWidth qui est la taille réelle du container affiché
              // et logo.crop.width qui est l'ancien crop (pour préserver l'échelle visuelle)
              const currentCropDisplayRatio = effectiveWidth / logo.crop.width;
              
              // Calculer les nouvelles dimensions display en préservant l'échelle visuelle
              let newDisplayWidth = Math.round(tempCropRef.current.width * currentCropDisplayRatio);
              let newDisplayHeight = Math.round(tempCropRef.current.height * currentCropDisplayRatio);
              
              // ✅ CRITIQUE: Garantir que les proportions correspondent EXACTEMENT au crop
              // Recalculer à partir de l'aspect ratio exact du crop pour éviter les arrondis
              if (newDisplayWidth > maxWidth) {
                newDisplayWidth = maxWidth;
              }
              newDisplayHeight = Math.round(newDisplayWidth / newCropAspectRatio);
              
              onCropSaveRef.current({
                ...logo,
                crop: tempCropRef.current,
                displayWidth: newDisplayWidth,
                displayHeight: newDisplayHeight
              });
            } else {
              onCropSaveRef.current({
                ...logo,
                crop: tempCropRef.current
              });
            }
            
            setIsCropMode(false);
          }}
        />
      )}


      {isCropMode && (() => {
        // ✅ FIX BUG BLANCS: Calcul correct des positions des poignées
        // PROBLÈME IDENTIFIÉ: Le container affiche la zone logo.crop (qui commence à logo.crop.x, logo.crop.y)
        // Les poignées doivent être positionnées RELATIVEMENT à cette zone affichée, pas en coordonnées absolues
        
        // Facteurs d'échelle : convertissent pixels SOURCE en pixels DISPLAY
        // Le container de taille effectiveWidth x effectiveHeight affiche une zone crop de taille activeCrop.width x activeCrop.height
        // Utiliser activeCrop (déjà défini plus haut)
        const displayScaleX = effectiveWidth / activeCrop.width
        const displayScaleY = effectiveHeight / activeCrop.height
        
        // ✅ CRITIQUE: Calculer la position RELATIVE du tempCrop par rapport à logo.crop
        // Le container affiche la zone logo.crop, donc on doit soustraire logo.crop.x/y pour obtenir
        // la position relative dans le container
        const relativeCropX = tempCrop.x - logo.crop.x
        const relativeCropY = tempCrop.y - logo.crop.y
        
        // Position des bords du crop en pixels display (relatifs au container)
        const cropLeftPx = relativeCropX * displayScaleX
        const cropTopPx = relativeCropY * displayScaleY
        const cropRightPx = (relativeCropX + tempCrop.width) * displayScaleX
        const cropBottomPx = (relativeCropY + tempCrop.height) * displayScaleY
        
        // Conversion en pourcentage du container
        const cropLeft = (cropLeftPx / effectiveWidth) * 100
        const cropTop = (cropTopPx / effectiveHeight) * 100
        const cropRight = (cropRightPx / effectiveWidth) * 100
        const cropBottom = (cropBottomPx / effectiveHeight) * 100
        
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
  );
}