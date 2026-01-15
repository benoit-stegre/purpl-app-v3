'use client'

import { Upload, Crop, Palette, Type, AlignLeft, Trash2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface FloatingToolbarProps {
  position: { top: number; left: number }
  
  // Props pour le mode TEXTE
  color?: string
  bold?: boolean
  italic?: boolean
  onBoldToggle?: () => void
  onItalicToggle?: () => void
  onColorClick?: () => void
  onFontClick?: () => void
  onAlignClick?: () => void
  
  // Props pour le mode IMAGE/LOGO
  mode?: 'text' | 'image'
  onUploadClick?: () => void
  onCropClick?: () => void
  onImageStyleClick?: () => void
  onDeleteClick?: () => void
  
  // Commun
  onClose: () => void
}

export default function FloatingToolbar({
  position,
  color,
  bold,
  italic,
  onBoldToggle,
  onItalicToggle,
  onColorClick,
  onFontClick,
  onAlignClick,
  mode = 'text',
  onUploadClick,
  onCropClick,
  onImageStyleClick,
  onDeleteClick,
  onClose
}: FloatingToolbarProps) {
  const Separator = () => (
    <div className="w-px h-6 bg-[#EDEAE3]" />
  )

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculer la position responsive pour éviter que le toolbar sorte de l'écran
  const toolbarWidth = 300 // Estimation de la largeur du toolbar
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
      className="bg-[#FFFEF5] border border-[#EDEAE3] rounded-xl shadow-lg p-1 flex items-center gap-1"
    >
      {mode === 'text' ? (
        <>
          {/* MODE TEXTE */}
          {/* B (Bold) */}
          <button
            onClick={onBoldToggle}
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base transition-colors ${
              bold 
                ? 'bg-[#76715A] text-white' 
                : 'text-[#2F2F2E] hover:bg-[#EDEAE3]'
            }`}
            title="Gras"
          >
            B
          </button>

          {/* I (Italic) */}
          <button
            onClick={onItalicToggle}
            className={`w-9 h-9 rounded-lg flex items-center justify-center italic text-base transition-colors ${
              italic 
                ? 'bg-[#76715A] text-white' 
                : 'text-[#2F2F2E] hover:bg-[#EDEAE3]'
            }`}
            title="Italique"
          >
            I
          </button>

          <Separator />

          {/* Palette */}
          <button
            onClick={onColorClick}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#2F2F2E] hover:bg-[#EDEAE3] transition-colors"
            title="Couleur"
          >
            <Palette className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* T (Police) */}
          <button
            onClick={onFontClick}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#2F2F2E] hover:bg-[#EDEAE3] transition-colors"
            title="Police"
          >
            <Type className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Alignement */}
          <button
            onClick={onAlignClick}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#2F2F2E] hover:bg-[#EDEAE3] transition-colors"
            title="Alignement"
          >
            <AlignLeft className="w-4 h-4" strokeWidth={2} />
          </button>
        </>
      ) : (
        <>
          {/* MODE IMAGE */}
          {/* Upload */}
          <button
            onClick={onUploadClick}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#2F2F2E] hover:bg-[#EDEAE3] transition-colors"
            title="Modifier l'image"
          >
            <Upload className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Crop */}
          <button
            onClick={onCropClick}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#2F2F2E] hover:bg-[#EDEAE3] transition-colors"
            title="Recadrer"
          >
            <Crop className="w-4 h-4" strokeWidth={2} />
          </button>

          <Separator />

          {/* Palette/Style */}
          <button
            onClick={onImageStyleClick}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#2F2F2E] hover:bg-[#EDEAE3] transition-colors"
            title="Style"
          >
            <Palette className="w-4 h-4" strokeWidth={2} />
          </button>

          <Separator />

          {/* Supprimer (rouge) */}
          <button
            onClick={onDeleteClick}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#C23C3C] hover:bg-[#C23C3C]/10 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </>
      )}
    </div>
  )

  // Utiliser un portail pour rendre le FloatingToolbar directement dans le body
  // Cela évite les problèmes d'overflow-hidden sur les parents
  if (!mounted) return null
  
  return createPortal(toolbarContent, document.body)
}