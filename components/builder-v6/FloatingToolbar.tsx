'use client'

import { ImagePlus, Crop, RectangleHorizontal } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface FloatingToolbarProps {
  position: { top: number; left: number }
  
  // Props pour le mode TEXTE
  font?: string
  fontSize?: number
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  cadreEnabled?: boolean
  onFontChange?: (font: string) => void
  onSizeChange?: (size: number) => void
  onBoldToggle?: () => void
  onItalicToggle?: () => void
  onUnderlineToggle?: () => void
  onColorClick?: () => void
  onAlignClick?: () => void
  onCadreClick?: () => void
  
  // Props pour le mode IMAGE/LOGO
  mode?: 'text' | 'image'
  onUploadClick?: () => void
  onImageAlignClick?: () => void
  onImageCadreClick?: () => void
  imageCadreEnabled?: boolean
  
  // Commun
  onClose: () => void
}

export default function FloatingToolbar({
  position,
  font,
  fontSize,
  color,
  bold,
  italic,
  underline,
  cadreEnabled,
  onFontChange,
  onSizeChange,
  onBoldToggle,
  onItalicToggle,
  onUnderlineToggle,
  onColorClick,
  onAlignClick,
  onCadreClick,
  mode = 'text',
  onUploadClick,
  onImageAlignClick,
  onImageCadreClick,
  imageCadreEnabled,
  onClose
}: FloatingToolbarProps) {
  const fonts = [
    'Arial',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS'
  ]

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSizeChange?.(parseInt(e.target.value))
  }

  const Separator = () => (
    <div className="h-8 w-px bg-gray-400" />
  )

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  console.log('[FloatingToolbar] RENDERING avec position:', position)
  console.log('[FloatingToolbar] Window width:', window.innerWidth, 'Window height:', window.innerHeight)
  console.log('[FloatingToolbar] Calculated left:', position.left, 'Calculated top:', position.top)
  
  // Vérifier si la position est hors écran
  const isOffScreen = position.left > window.innerWidth || position.top > window.innerHeight
  if (isOffScreen) {
    console.warn('[FloatingToolbar] ⚠️ Position hors écran !', { left: position.left, top: position.top, windowWidth: window.innerWidth, windowHeight: window.innerHeight })
  }
  
  // Calculer la position responsive pour éviter que le toolbar sorte de l'écran
  const toolbarWidth = 400 // Estimation de la largeur du toolbar
  const adjustedLeft = Math.min(
    position.left,
    window.innerWidth - toolbarWidth - 10 // 10px de marge du bord droit
  )

  const toolbarContent = (
    <div
      style={{
        position: 'fixed',
        top: position.top + 'px',
        left: adjustedLeft + 'px',
        zIndex: 99999,
        maxWidth: '90vw' // Responsive : max 90% de la largeur de la fenêtre
      }}
      className="bg-white border-2 border-gray-400 rounded-lg shadow-xl px-2 py-2 flex items-center gap-2"
    >
      {mode === 'text' ? (
        <>
          {/* MODE TEXTE (actuel) */}
          <select
            value={font}
            onChange={(e) => onFontChange?.(e.target.value)}
            className="px-2 py-1 text-sm text-gray-900 font-medium hover:bg-gray-50 cursor-pointer rounded"
          >
            {fonts.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <Separator />

          <div className="flex items-center gap-1">
            <button
              onClick={() => onSizeChange?.(Math.max(24, fontSize! - 2))}
              className="text-gray-900 font-bold hover:bg-gray-100 px-1.5 py-0.5 rounded text-sm"
            >
              −
            </button>
            <input
              type="range"
              min="24"
              max="48"
              value={fontSize}
              onChange={handleSliderChange}
              className="w-16"
              style={{
                accentColor: '#1f2937'
              }}
            />
            <button
              onClick={() => onSizeChange?.(Math.min(48, fontSize! + 2))}
              className="text-gray-900 font-bold hover:bg-gray-100 px-1.5 py-0.5 rounded text-sm"
            >
              +
            </button>
          </div>

          <Separator />

          <div className="flex items-center gap-1">
            <button
              onClick={onBoldToggle}
              className={'w-8 h-8 hover:bg-gray-50 flex items-center justify-center font-bold text-base rounded ' + (bold ? 'bg-blue-100 text-blue-600' : 'text-gray-900')}
              title="Gras"
            >
              B
            </button>

            <button
              onClick={onItalicToggle}
              className={'w-8 h-8 hover:bg-gray-50 flex items-center justify-center font-bold text-base italic rounded ' + (italic ? 'bg-blue-100 text-blue-600' : 'text-gray-900')}
              title="Italique"
            >
              I
            </button>

            <button
              onClick={onUnderlineToggle}
              className={'w-8 h-8 hover:bg-gray-50 flex items-center justify-center font-bold text-base underline rounded ' + (underline ? 'bg-blue-100 text-blue-600' : 'text-gray-900')}
              title="Souligné"
            >
              U
            </button>
          </div>

          <Separator />

          <button
            onClick={onColorClick}
            className="w-8 h-8 hover:bg-gray-50 flex flex-col items-center justify-center gap-0.5 rounded"
          >
            <span className="text-xs font-bold text-gray-900">Aa</span>
            <span
              className="w-5 h-1 rounded"
              style={{ backgroundColor: color }}
            />
          </button>

          <Separator />

          <button
            onClick={onAlignClick}
            className="w-8 h-8 hover:bg-gray-50 flex items-center justify-center font-bold text-gray-900 rounded"
            title="Alignement"
          >
            ≡
          </button>

          <Separator />

          <button
            onClick={onCadreClick}
            className={'w-8 h-8 hover:bg-gray-50 flex items-center justify-center font-bold rounded ' + (cadreEnabled ? 'bg-blue-100 text-blue-600' : 'text-gray-900')}
          >
            ⬜
          </button>
        </>
      ) : (
        <>
          {/* MODE IMAGE/LOGO (nouveau) */}
          <button
            onClick={onUploadClick}
            className="w-8 h-8 hover:bg-gray-50 flex items-center justify-center rounded"
            title="Modifier le logo"
          >
            <ImagePlus className="w-5 h-5 text-gray-900" strokeWidth={2} />
          </button>



          <Separator />

          <button
            onClick={onImageAlignClick}
            className="w-8 h-8 hover:bg-gray-50 flex items-center justify-center font-bold text-gray-900 rounded"
            title="Alignement"
          >
            ≡
          </button>

          <Separator />

          <button
            onClick={onImageCadreClick}
            className={'w-8 h-8 hover:bg-gray-50 flex items-center justify-center rounded ' + (imageCadreEnabled ? 'bg-blue-100 text-blue-600' : 'text-gray-900')}
            title="Cadre"
          >
            <RectangleHorizontal className="w-5 h-5" strokeWidth={2} />
          </button>
        </>
      )}

      <Separator />

      <button
        onClick={onClose}
        className="w-8 h-8 hover:bg-gray-50 flex items-center justify-center font-bold text-gray-900 rounded"
      >
        ✕
      </button>
    </div>
  )

  // Utiliser un portail pour rendre le FloatingToolbar directement dans le body
  // Cela évite les problèmes d'overflow-hidden sur les parents
  if (!mounted) return null
  
  return createPortal(toolbarContent, document.body)
}