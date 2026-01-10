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
  
  const [imageDisplaySize, setImageDisplaySize] = useState({
    width: 0,
    height: 0
  });
  
  const [cropSelection, setCropSelection] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  });
  
  const [appliedCrop, setAppliedCrop] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    imageWidth: number;
    imageHeight: number;
  } | null>(null);
  
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  
  const dragStateRef = useRef<{
    type: 'resize' | 'crop';
    corner?: ResizeCorner;
    side?: CropSide;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startSelection?: { top: number; left: number; width: number; height: number };
  } | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'normal') return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dragStateRef.current) return;
      
      if (imageContainerRef.current && !imageContainerRef.current.contains(e.target as Node)) {
        if (mode === 'crop') {
          setAppliedCrop({
            top: cropSelection.top,
            left: cropSelection.left,
            width: cropSelection.width,
            height: cropSelection.height,
            imageWidth: imageDisplaySize.width,
            imageHeight: imageDisplaySize.height
          });
          
          setContainerSize({
            width: cropSelection.width,
            height: cropSelection.height
          });
          
          const cropData: CropData = {
            x: cropSelection.left,
            y: cropSelection.top,
            width: cropSelection.width,
            height: cropSelection.height,
            scale: 1
          };
          onCropComplete(cropData);
          
          setMode('resize');
        } else if (mode === 'resize') {
          setMode('normal');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mode, cropSelection, imageDisplaySize, onCropComplete]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const initialWidth = maxWidth * 0.8;
      const initialHeight = initialWidth * aspectRatio;
      
      const finalWidth = initialWidth;
      const finalHeight = Math.min(initialHeight, maxHeight * 0.8);
      
      setContainerSize({
        width: finalWidth,
        height: finalHeight
      });
      
      setImageDisplaySize({
        width: finalWidth,
        height: finalHeight
      });
      
      setCropSelection({
        top: 0,
        left: 0,
        width: finalWidth,
        height: finalHeight
      });
      
      setIsLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl, maxWidth, maxHeight]);

  const handleClick = (e: React.MouseEvent) => {
    if (mode === 'normal') {
      setMode('resize');
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === 'resize') {
      if (appliedCrop) {
        const scale = containerSize.width / appliedCrop.width;
        
        setImageDisplaySize({
          width: appliedCrop.imageWidth * scale,
          height: appliedCrop.imageHeight * scale
        });
        
        setCropSelection({
          top: appliedCrop.top * scale,
          left: appliedCrop.left * scale,
          width: appliedCrop.width * scale,
          height: appliedCrop.height * scale
        });
        
        setContainerSize({
          width: appliedCrop.imageWidth * scale,
          height: appliedCrop.imageHeight * scale
        });
      } else {
        setCropSelection({
          top: 0,
          left: 0,
          width: containerSize.width,
          height: containerSize.height
        });
      }
      
      setAppliedCrop(null);
      setMode('crop');
    }
  };

  const handleResizeMouseDown = (corner: ResizeCorner, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStateRef.current = {
      type: 'resize',
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: containerSize.width,
      startHeight: containerSize.height
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStateRef.current || dragStateRef.current.type !== 'resize') return;

      const deltaX = moveEvent.clientX - dragStateRef.current.startX;
      const aspectRatio = dragStateRef.current.startHeight / dragStateRef.current.startWidth;
      
      let newWidth = dragStateRef.current.startWidth;

      switch (dragStateRef.current.corner) {
        case 'tl':
        case 'bl':
          newWidth = dragStateRef.current.startWidth - deltaX;
          break;
        case 'tr':
        case 'br':
          newWidth = dragStateRef.current.startWidth + deltaX;
          break;
      }

      newWidth = Math.max(100, Math.min(maxWidth * 0.95, newWidth));
      const newHeight = newWidth * aspectRatio;

      if (newHeight <= maxHeight * 0.95) {
        setContainerSize({
          width: newWidth,
          height: newHeight
        });
      }
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCropMouseDown = (side: CropSide, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragStateRef.current = {
      type: 'crop',
      side,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: containerSize.width,
      startHeight: containerSize.height,
      startSelection: { ...cropSelection }
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStateRef.current || dragStateRef.current.type !== 'crop') return;

      const deltaX = moveEvent.clientX - dragStateRef.current.startX;
      const deltaY = moveEvent.clientY - dragStateRef.current.startY;
      
      const newSelection = { ...dragStateRef.current.startSelection! };

      switch (dragStateRef.current.side) {
        case 'top':
          newSelection.top = Math.max(0, 
            Math.min(dragStateRef.current.startSelection!.top + deltaY, 
              dragStateRef.current.startSelection!.top + dragStateRef.current.startSelection!.height - 50
            )
          );
          newSelection.height = Math.max(50, 
            dragStateRef.current.startSelection!.height - deltaY
          );
          break;
          
        case 'bottom':
          newSelection.height = Math.max(50, 
            Math.min(
              dragStateRef.current.startSelection!.height + deltaY,
              containerSize.height - dragStateRef.current.startSelection!.top
            )
          );
          break;
          
        case 'left':
          newSelection.left = Math.max(0, 
            Math.min(dragStateRef.current.startSelection!.left + deltaX, 
              dragStateRef.current.startSelection!.left + dragStateRef.current.startSelection!.width - 50
            )
          );
          newSelection.width = Math.max(50, 
            dragStateRef.current.startSelection!.width - deltaX
          );
          break;
          
        case 'right':
          newSelection.width = Math.max(50, 
            Math.min(
              dragStateRef.current.startSelection!.width + deltaX,
              containerSize.width - dragStateRef.current.startSelection!.left
            )
          );
          break;
      }

      setCropSelection(newSelection);
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

  const showCroppedImage = mode !== 'crop' && appliedCrop;

  return (
    <div 
      className="relative mx-auto flex items-center justify-center"
      style={{ 
        width: maxWidth,
        height: maxHeight
      }}
    >
      <div
        ref={imageContainerRef}
        className="relative"
        style={{
          width: containerSize.width,
          height: containerSize.height,
          cursor: mode === 'normal' ? 'pointer' : 'default'
        }}
        onClick={mode === 'normal' ? handleClick : undefined}
        onDoubleClick={mode === 'resize' ? handleDoubleClick : undefined}
      >
        {showCroppedImage ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${appliedCrop.imageWidth}px ${appliedCrop.imageHeight}px`,
              backgroundPosition: `-${appliedCrop.left}px -${appliedCrop.top}px`,
              backgroundRepeat: 'no-repeat'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: mode === 'crop' ? 0.3 : 1,
              transition: 'opacity 0.2s'
            }}
          />
        )}

        {mode === 'crop' && (
          <div
            style={{
              position: 'absolute',
              top: cropSelection.top,
              left: cropSelection.left,
              width: cropSelection.width,
              height: cropSelection.height,
              border: '3px solid #3B82F6',
              overflow: 'hidden',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                width: containerSize.width,
                height: containerSize.height,
                marginTop: -cropSelection.top,
                marginLeft: -cropSelection.left,
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          </div>
        )}

        {mode === 'resize' && (
          <>
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize hover:scale-125 transition-transform"
              style={{ top: -8, left: -8, zIndex: 20 }}
              onMouseDown={(e) => handleResizeMouseDown('tl', e)}
            />
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize hover:scale-125 transition-transform"
              style={{ top: -8, right: -8, zIndex: 20 }}
              onMouseDown={(e) => handleResizeMouseDown('tr', e)}
            />
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize hover:scale-125 transition-transform"
              style={{ bottom: -8, left: -8, zIndex: 20 }}
              onMouseDown={(e) => handleResizeMouseDown('bl', e)}
            />
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize hover:scale-125 transition-transform"
              style={{ bottom: -8, right: -8, zIndex: 20 }}
              onMouseDown={(e) => handleResizeMouseDown('br', e)}
            />
          </>
        )}

        {mode === 'crop' && (
          <>
            <div
              className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform"
              style={{ 
                top: cropSelection.top - 8,
                left: cropSelection.left + cropSelection.width / 2 - 8,
                zIndex: 30
              }}
              onMouseDown={(e) => handleCropMouseDown('top', e)}
            />
            <div
              className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform"
              style={{ 
                top: cropSelection.top + cropSelection.height / 2 - 8,
                left: cropSelection.left + cropSelection.width - 8,
                zIndex: 30
              }}
              onMouseDown={(e) => handleCropMouseDown('right', e)}
            />
            <div
              className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform"
              style={{ 
                top: cropSelection.top + cropSelection.height - 8,
                left: cropSelection.left + cropSelection.width / 2 - 8,
                zIndex: 30
              }}
              onMouseDown={(e) => handleCropMouseDown('bottom', e)}
            />
            <div
              className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform"
              style={{ 
                top: cropSelection.top + cropSelection.height / 2 - 8,
                left: cropSelection.left - 8,
                zIndex: 30
              }}
              onMouseDown={(e) => handleCropMouseDown('left', e)}
            />
          </>
        )}
      </div>
    </div>
  );
}