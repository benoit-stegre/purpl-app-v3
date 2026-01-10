'use client';
import { useState, useRef, useEffect } from 'react';

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

interface ImageCropCanvasProps {
  imageUrl: string;
  initialCropData?: CropData | null;
  maxWidth: number;
  maxHeight: number;
  onCropComplete: (cropData: CropData) => void;
}

type ResizeCorner = 'tl' | 'tr' | 'bl' | 'br';
type CropSide = 'top' | 'right' | 'bottom' | 'left';

export default function ImageCropCanvas({
  imageUrl,
  initialCropData,
  maxWidth,
  maxHeight,
  onCropComplete
}: ImageCropCanvasProps) {
  const [mode, setMode] = useState<'normal' | 'resize' | 'crop'>('normal');
  const [containerSize, setContainerSize] = useState({
    width: initialCropData?.width || maxWidth * 0.8,
    height: initialCropData?.height || (maxWidth * 0.8) * 0.75
  });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  
  // ✅ NOUVEAU : Viewport avec offsets pour garder l'image fixe
  const [cropViewport, setCropViewport] = useState({
    width: containerSize.width,
    height: containerSize.height,
    offsetTop: 0,    // Distance depuis le centre vers le haut/bas
    offsetLeft: 0    // Distance depuis le centre vers gauche/droite
  });
  
  const dragStateRef = useRef<{
    type: 'resize' | 'crop';
    corner?: ResizeCorner;
    side?: CropSide;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startOffsetTop: number;
    startOffsetLeft: number;
  } | null>(null);

  // Charger l'image pour obtenir ses dimensions naturelles
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const initialWidth = maxWidth * 0.8;
      const initialHeight = initialWidth * aspectRatio;
      
      setContainerSize({
        width: initialWidth,
        height: Math.min(initialHeight, maxHeight * 0.8)
      });
      
      setCropViewport({
        width: initialWidth,
        height: Math.min(initialHeight, maxHeight * 0.8),
        offsetTop: 0,
        offsetLeft: 0
      });
      
      setIsLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl, maxWidth, maxHeight]);

  // Clic simple → Mode RESIZE
  const handleClick = (e: React.MouseEvent) => {
    if (mode === 'normal') {
      setMode('resize');
    }
  };

  // Double-clic → Mode CROP
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === 'resize') {
      setMode('crop');
    } else if (mode === 'crop') {
      setMode('resize');
    }
  };

  // Clic en dehors → Appliquer le crop et retour normal
  const handleClickOutside = () => {
    if (mode === 'crop') {
      // ✅ APPLIQUER LE CROP : Réduire containerSize à cropViewport
      setContainerSize({
        width: cropViewport.width,
        height: cropViewport.height
      });
      
      // Réinitialiser viewport sans offsets
      setCropViewport({
        width: cropViewport.width,
        height: cropViewport.height,
        offsetTop: 0,
        offsetLeft: 0
      });
      
      const cropData: CropData = {
        x: cropViewport.offsetLeft,
        y: cropViewport.offsetTop,
        width: cropViewport.width,
        height: cropViewport.height,
        scale: 1
      };
      onCropComplete(cropData);
    }
    
    setMode('normal');
  };

  // RESIZE - Poignées aux coins (proportionnel)
  const handleResizeMouseDown = (corner: ResizeCorner, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStateRef.current = {
      type: 'resize',
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: containerSize.width,
      startHeight: containerSize.height,
      startOffsetTop: 0,
      startOffsetLeft: 0
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStateRef.current || dragStateRef.current.type !== 'resize') return;

      const deltaX = moveEvent.clientX - dragStateRef.current.startX;
      const deltaY = moveEvent.clientY - dragStateRef.current.startY;
      
      const aspectRatio = dragStateRef.current.startHeight / dragStateRef.current.startWidth;
      
      let newWidth = dragStateRef.current.startWidth;
      let newHeight = dragStateRef.current.startHeight;

      switch (dragStateRef.current.corner) {
        case 'tl':
          newWidth = dragStateRef.current.startWidth - deltaX;
          break;
        case 'tr':
          newWidth = dragStateRef.current.startWidth + deltaX;
          break;
        case 'bl':
          newWidth = dragStateRef.current.startWidth - deltaX;
          break;
        case 'br':
          newWidth = dragStateRef.current.startWidth + deltaX;
          break;
      }

      newHeight = newWidth * aspectRatio;
      newWidth = Math.max(100, Math.min(newWidth, maxWidth));
      newHeight = Math.max(75, Math.min(newHeight, maxHeight));

      setContainerSize({ width: newWidth, height: newHeight });
      setCropViewport({ 
        width: newWidth, 
        height: newHeight,
        offsetTop: 0,
        offsetLeft: 0
      });
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // ✅ CROP CORRIGÉ - Poignées indépendantes avec offsets
  const handleCropMouseDown = (side: CropSide, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStateRef.current = {
      type: 'crop',
      side,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: cropViewport.width,
      startHeight: cropViewport.height,
      startOffsetTop: cropViewport.offsetTop,
      startOffsetLeft: cropViewport.offsetLeft
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStateRef.current || dragStateRef.current.type !== 'crop') return;

      const deltaX = moveEvent.clientX - dragStateRef.current.startX;
      const deltaY = moveEvent.clientY - dragStateRef.current.startY;
      
      let newWidth = dragStateRef.current.startWidth;
      let newHeight = dragStateRef.current.startHeight;
      let newOffsetTop = dragStateRef.current.startOffsetTop;
      let newOffsetLeft = dragStateRef.current.startOffsetLeft;

      // ✅ LOGIQUE CORRIGÉE : Image fixe, viewport se déplace
      switch (dragStateRef.current.side) {
        case 'top':
          // Réduire hauteur ET déplacer viewport vers le bas
          newHeight = dragStateRef.current.startHeight - deltaY;
          newOffsetTop = dragStateRef.current.startOffsetTop + deltaY / 2;
          break;
          
        case 'bottom':
          // Augmenter hauteur seulement (viewport descend)
          newHeight = dragStateRef.current.startHeight + deltaY;
          newOffsetTop = dragStateRef.current.startOffsetTop + deltaY / 2;
          break;
          
        case 'left':
          // Réduire largeur ET déplacer viewport vers la droite
          newWidth = dragStateRef.current.startWidth - deltaX;
          newOffsetLeft = dragStateRef.current.startOffsetLeft + deltaX / 2;
          break;
          
        case 'right':
          // Augmenter largeur seulement (viewport va à droite)
          newWidth = dragStateRef.current.startWidth + deltaX;
          newOffsetLeft = dragStateRef.current.startOffsetLeft + deltaX / 2;
          break;
      }

      // Limites : ne pas dépasser le container
      const maxOffsetTop = (containerSize.height - newHeight) / 2;
      const maxOffsetLeft = (containerSize.width - newWidth) / 2;
      
      newWidth = Math.max(50, Math.min(newWidth, containerSize.width));
      newHeight = Math.max(50, Math.min(newHeight, containerSize.height));
      newOffsetTop = Math.max(-maxOffsetTop, Math.min(newOffsetTop, maxOffsetTop));
      newOffsetLeft = Math.max(-maxOffsetLeft, Math.min(newOffsetLeft, maxOffsetLeft));

      setCropViewport({ 
        width: newWidth, 
        height: newHeight,
        offsetTop: newOffsetTop,
        offsetLeft: newOffsetLeft
      });
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!isLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded"
        style={{ width: maxWidth, height: maxHeight }}
      >
        <span className="text-gray-500">Chargement...</span>
      </div>
    );
  }

  return (
    <div 
      className="relative mx-auto flex items-center justify-center"
      style={{ 
        width: maxWidth,
        height: maxHeight
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClickOutside();
        }
      }}
    >
      {/* ✅ Container EXTERNE - Taille actuelle de l'image */}
      <div
        className="relative"
        style={{
          width: containerSize.width,
          height: containerSize.height,
          cursor: mode === 'normal' ? 'pointer' : 'default'
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* ✅ IMAGE FIXE au centre absolu */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: containerSize.width,
            height: containerSize.height,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* ✅ VIEWPORT qui se déplace (mode CROP uniquement) */}
        {mode === 'crop' && (
          <div
            style={{
              position: 'absolute',
              top: `calc(50% + ${cropViewport.offsetTop}px)`,
              left: `calc(50% + ${cropViewport.offsetLeft}px)`,
              transform: 'translate(-50%, -50%)',
              width: cropViewport.width,
              height: cropViewport.height,
              border: '3px solid #3B82F6',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              zIndex: 2
            }}
          />
        )}

        {/* Bordure mode RESIZE */}
        {mode === 'resize' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid #3B82F6',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Poignées RESIZE (aux coins) */}
        {mode === 'resize' && (
          <>
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize hover:scale-125 transition-transform z-10"
              style={{ top: -8, left: -8 }}
              onMouseDown={(e) => handleResizeMouseDown('tl', e)}
            />
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize hover:scale-125 transition-transform z-10"
              style={{ top: -8, right: -8 }}
              onMouseDown={(e) => handleResizeMouseDown('tr', e)}
            />
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize hover:scale-125 transition-transform z-10"
              style={{ bottom: -8, left: -8 }}
              onMouseDown={(e) => handleResizeMouseDown('bl', e)}
            />
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize hover:scale-125 transition-transform z-10"
              style={{ bottom: -8, right: -8 }}
              onMouseDown={(e) => handleResizeMouseDown('br', e)}
            />
          </>
        )}
      </div>

      {/* ✅ Poignées CROP (positionnées sur le viewport mobile) */}
      {mode === 'crop' && (
        <div
          style={{
            position: 'absolute',
            top: `calc(50% + ${cropViewport.offsetTop}px)`,
            left: `calc(50% + ${cropViewport.offsetLeft}px)`,
            transform: 'translate(-50%, -50%)',
            width: cropViewport.width,
            height: cropViewport.height,
            pointerEvents: 'none',
            zIndex: 3
          }}
        >
          {/* Top */}
          <div
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ns-resize hover:scale-125 transition-transform"
            style={{ 
              top: -8, 
              left: '50%', 
              transform: 'translateX(-50%)',
              pointerEvents: 'auto'
            }}
            onMouseDown={(e) => handleCropMouseDown('top', e)}
          />
          {/* Right */}
          <div
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ew-resize hover:scale-125 transition-transform"
            style={{ 
              right: -8, 
              top: '50%', 
              transform: 'translateY(-50%)',
              pointerEvents: 'auto'
            }}
            onMouseDown={(e) => handleCropMouseDown('right', e)}
          />
          {/* Bottom */}
          <div
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ns-resize hover:scale-125 transition-transform"
            style={{ 
              bottom: -8, 
              left: '50%', 
              transform: 'translateX(-50%)',
              pointerEvents: 'auto'
            }}
            onMouseDown={(e) => handleCropMouseDown('bottom', e)}
          />
          {/* Left */}
          <div
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ew-resize hover:scale-125 transition-transform"
            style={{ 
              left: -8, 
              top: '50%', 
              transform: 'translateY(-50%)',
              pointerEvents: 'auto'
            }}
            onMouseDown={(e) => handleCropMouseDown('left', e)}
          />
        </div>
      )}

      {/* Instructions */}
      {mode !== 'normal' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded shadow-lg text-xs text-gray-600 z-20">
          {mode === 'resize' && 'Drag les coins pour resize • Double-clic pour crop'}
          {mode === 'crop' && 'Drag les côtés pour rogner • Clic en dehors pour valider'}
        </div>
      )}
    </div>
  );
}
