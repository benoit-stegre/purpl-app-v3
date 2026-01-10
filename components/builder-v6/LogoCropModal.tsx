'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ZoomIn, ZoomOut } from 'lucide-react'

interface LogoCropModalProps {
  imageUrl: string
  initialWidth: number
  initialHeight: number
  onSave: (width: number, height: number, crop: { x: number; y: number; scale: number }) => void
  onCancel: () => void
}

export default function LogoCropModal({
  imageUrl,
  initialWidth,
  initialHeight,
  onSave,
  onCancel
}: LogoCropModalProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleSave = () => {
    onSave(initialWidth, initialHeight, { x: position.x, y: position.y, scale })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Recadrer le logo</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Zone de crop */}
          <div
            ref={containerRef}
            className="relative bg-gray-100 rounded-lg overflow-hidden mb-4"
            style={{
              width: '600px',
              height: '400px',
              margin: '0 auto',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
          {/* Cadre avec traits épais aux 4 coins */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Coin haut-gauche */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500" />
            {/* Coin haut-droite */}
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500" />
            {/* Coin bas-gauche */}
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500" />
            {/* Coin bas-droite */}
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500" />
          </div>

          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Logo"
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
              transformOrigin: 'center',
              userSelect: 'none',
              maxWidth: 'none'
            }}
            onMouseDown={handleMouseDown}
            draggable={false}
          />
        </div>

          {/* Contrôles de zoom */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Dézoomer"
            >
              <ZoomOut className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-12">Zoom</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-48"
                style={{ accentColor: '#3B82F6' }}
              />
              <span className="text-sm font-mono text-gray-700 w-12">{Math.round(scale * 100)}%</span>
            </div>

            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoomer"
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  )
}