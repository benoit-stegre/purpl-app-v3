'use client'

import { useRef, useEffect } from 'react'

interface EditableTextProps {
  text: string
  font: string
  fontSize: number
  color: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  bold?: boolean
  italic?: boolean
  underline?: boolean
  placeholder?: string
  cadre: {
    enabled: boolean
    backgroundColor: string
    borderRadius: number
    padding: number
    border?: {
      enabled: boolean
      color: string
      width: number
    }
  }
  isActive: boolean
  onFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onBlur: () => void
  onChange: (text: string) => void
}

export default function EditableText({
  text,
  font,
  fontSize,
  color,
  textAlign = 'center',
  bold = false,
  italic = false,
  underline = false,
  placeholder = 'Texte',
  cadre,
  isActive,
  onFocus,
  onBlur,
  onChange
}: EditableTextProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const shouldApplyWrapper = cadre.enabled || cadre.border?.enabled

  useEffect(() => {
    if (textareaRef.current) {
      if (shouldApplyWrapper) {
        // Ajuster la hauteur automatiquement pour les autres cas
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      } else {
        // Pour le bouton, ajuster la largeur selon le contenu mais respecter le container
        // SAUF si justify : dans ce cas, prendre 100% de la largeur
        if (textAlign === 'justify') {
          textareaRef.current.style.width = '100%'
          textareaRef.current.style.height = '100%'
        } else {
          const parentWidth = textareaRef.current.parentElement?.clientWidth || 0
          textareaRef.current.style.width = 'auto'
          // Mesurer la largeur réelle nécessaire pour le texte
          const scrollWidth = textareaRef.current.scrollWidth
          // Largeur minimale pour éviter que le bouton disparaisse quand le texte est vide
          // Le parent a minWidth: 200px avec padding 16px 28px, donc le contenu interne doit être au moins ~144px
          const minWidth = 144
          // Ne pas dépasser la largeur du parent (avec une marge de sécurité)
          const maxWidth = parentWidth > 0 ? parentWidth - 4 : Infinity
          const calculatedWidth = Math.min(Math.max(scrollWidth + 2, minWidth), maxWidth)
          textareaRef.current.style.width = calculatedWidth + 'px'
          // Hauteur fixe pour une seule ligne
          textareaRef.current.style.height = '100%'
        }
      }
    }
  }, [text, fontSize, shouldApplyWrapper, textAlign])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const effectiveTextAlign = !text || text.trim() === '' ? 'center' : textAlign

  const wrapperStyle: React.CSSProperties = {
    // Toujours respecter la largeur du parent pour éviter les débordements
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden', // Empêcher tout débordement
    // Ne pas ajouter minHeight si le cadre n'est pas activé (pour le bouton)
    ...(shouldApplyWrapper ? {
      minHeight: '60px',
      position: 'relative',
      borderRadius: cadre.borderRadius + 'px',
      padding: cadre.padding + 'px',
      ...(cadre.enabled && {
        backgroundColor: cadre.backgroundColor
      }),
      ...(cadre.border?.enabled && {
        border: cadre.border.width + 'px solid ' + cadre.border.color
      })
    } : {
      position: 'relative',
      minHeight: 'auto',
      height: '100%',
      textAlign: effectiveTextAlign, // Utiliser textAlign CSS pour l'alignement
      minWidth: '144px' // Largeur minimale pour éviter que le bouton disparaisse (200px - padding du bouton)
    })
  }

  // Pour justify, toujours prendre 100% de la largeur pour que le texte s'étende sur tout le container
  const shouldTakeFullWidth = shouldApplyWrapper || textAlign === 'justify'

  const textareaStyle: React.CSSProperties = {
    fontFamily: font,
    fontSize: fontSize + 'px',
    color: color,
    width: shouldTakeFullWidth ? '100%' : 'auto', // 100% pour justify ou avec wrapper, auto pour le bouton
    maxWidth: '100%', // Empêcher le débordement - toujours respecter le container
    textAlign: effectiveTextAlign,
    fontWeight: bold ? 'bold' : 'normal',
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: underline ? 'underline' : 'none',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    direction: 'ltr',
    padding: shouldApplyWrapper ? '8px' : '0', // Pas de padding si pas de cadre (pour le bouton)
    resize: 'none',
    overflow: 'hidden', // Toujours hidden pour éviter les débordements
    whiteSpace: shouldApplyWrapper || textAlign === 'justify' ? 'pre-wrap' : 'nowrap', // pre-wrap pour justify et avec wrapper, nowrap pour le bouton
    wordWrap: 'break-word', // Toujours break-word pour éviter les débordements
    cursor: 'text',
    minHeight: shouldApplyWrapper ? '44px' : 'auto', // Pas de minHeight si pas de cadre
    minWidth: shouldApplyWrapper ? 'auto' : '0', // Permet au textarea de rétrécir pour le bouton
    boxSizing: 'border-box' // Inclure padding dans la largeur
  }

  const isEmpty = !text || text.trim() === ''
  const showPlaceholder = isEmpty && !isActive

  return (
    <div style={wrapperStyle}>
      {showPlaceholder && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 0,
            color: '#9CA3AF',
            fontSize: '14px',
            whiteSpace: 'nowrap'
          }}
        >
          {placeholder}
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        rows={1}
        style={textareaStyle}
        placeholder=""
      />
    </div>
  )
}