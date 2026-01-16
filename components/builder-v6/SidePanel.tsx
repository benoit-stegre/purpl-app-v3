'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Upload, X, Trash2 } from 'lucide-react'

// COULEURS V0 EXACTES
const V0_COLORS = {
  accent: '#76715A',        // Olive PURPL - toggles, bordures sélection
  border: '#EDEAE3',        // Bordures éléments
  separator: '#D6CCAF',     // Séparateurs entre boutons
  label: '#76715A',         // Textes labels
  value: '#2F2F2E',         // Textes valeurs (hex, px)
  hoverBg: '#EDEAE3',       // Fond hover
  white: '#FFFFFF',
}

// Liste des polices disponibles
const FONTS = [
  { name: "DM Sans", value: "DM Sans" },
  { name: "Albert Sans", value: "Albert Sans" },
  { name: "Arial", value: "Arial" },
  { name: "Georgia", value: "Georgia" },
  { name: "Times New Roman", value: "Times New Roman" },
]

interface SidePanelProps {
  type: 'color' | 'alignment' | 'cadre' | 'upload' | 'logo-alignment' | 'font'
  position?: { top: number; left: number }
  color?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  projectColors?: string[]
  cadre?: {
    enabled: boolean
    backgroundColor: string
    borderRadius: number
    borderRadiusEnabled?: boolean
    padding?: number
    border?: {
      enabled: boolean
      color: string
      width: number
    }
    shadow?: {
      enabled: boolean
      blur: number
      offsetY: number
      color: string
    }
    syncWithGlobal?: boolean
  }
  // Props pour upload
  currentImageUrl?: string
  onImageUpload?: (file: File) => void
  onImageRemove?: () => void
  acceptedFormats?: string[]
  maxSize?: number
  uploadError?: string | null
  logoAlignment?: 'left' | 'center' | 'right'
  onLogoAlignChange?: (alignment: 'left' | 'center' | 'right') => void
  isLogoMode?: boolean
  // Props pour font
  font?: string
  fontSize?: number
  onFontChange?: (font: string) => void
  onSizeChange?: (size: number) => void
  
  onColorChange?: (color: string) => void
  onAlignChange?: (align: 'left' | 'center' | 'right' | 'justify') => void
  onCadreToggle?: () => void
  onCadreChange?: (cadre: any) => void
  onToggleSyncWithGlobal?: () => void
  onClose: () => void
}

export default function SidePanel({
  type,
  position,
  color,
  textAlign,
  projectColors = [],
  cadre,
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  acceptedFormats = ['.jpg', '.jpeg', '.png', '.svg', '.webp'],
  maxSize = 5 * 1024 * 1024, // 5MB
  uploadError,
  logoAlignment,
  onLogoAlignChange,
  isLogoMode = false,
  font,
  fontSize,
  onFontChange,
  onSizeChange,
  onColorChange,
  onAlignChange,
  onCadreToggle,
  onCadreChange,
  onToggleSyncWithGlobal,
  onClose
}: SidePanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Séparateur V0
  const Separator = () => (
    <div className="h-px w-full bg-[#EDEAE3] my-3" />
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Le parent (LogoHeaderInlineEditor) gère la validation et l'erreur
    onImageUpload?.(file)
  }

  
  const renderLogoAlignmentPanel = () => {
    const alignments: Array<{
      value: 'left' | 'center' | 'right'
      label: string
      icon: string
    }> = [
      { value: 'left', label: 'Gauche', icon: '←' },
      { value: 'center', label: 'Centre', icon: '↔' },
      { value: 'right', label: 'Droite', icon: '→' }
    ]

    return (
      <div className="space-y-3">
        <p className="text-xs text-[#76715A] uppercase tracking-wide font-medium">
          Alignement du logo
        </p>

        <div className="grid grid-cols-3 gap-2">
          {alignments.map((align) => (
            <button
              key={align.value}
              onClick={() => onLogoAlignChange?.(align.value)}
              className={`p-4 rounded-lg flex flex-col items-center justify-center border-2 hover:bg-[#EDEAE3] transition-colors ${
                logoAlignment === align.value 
                  ? 'bg-[#EDEAE3] border-[#76715A]' 
                  : 'border-[#EDEAE3]'
              }`}
              title={align.label}
            >
              <div className="text-2xl mb-2 text-[#76715A]">{align.icon}</div>
              <span className="text-xs text-[#76715A]">{align.label}</span>
            </button>
          ))}
        </div>

        <div className="text-xs text-[#76715A] bg-[#EDEAE3]/30 rounded-lg p-3">
          Alignement horizontal du logo dans l'espace disponible.
        </div>
      </div>
    )
  }

  const renderUploadPanel = () => (
    <div className="space-y-3">
      <p className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Modifier le logo</p>

      {currentImageUrl ? (
        <div className="relative">
          <img 
            src={currentImageUrl} 
            alt="Logo actuel" 
            className="w-full h-48 object-contain bg-[#EDEAE3]/30 rounded-lg border border-[#EDEAE3]"
          />
          <button
            onClick={onImageRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Supprimer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#EDEAE3] rounded-lg cursor-pointer hover:bg-[#EDEAE3]/30 hover:border-[#76715A] transition-colors">
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-[#76715A] mb-2" />
            <p className="text-sm text-[#76715A] font-medium">Cliquer pour uploader</p>
            <p className="text-xs text-[#76715A]/60 mt-1">
              Max {(maxSize / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
          />
        </label>
      )}

      {uploadError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {uploadError}
        </div>
      )}

      <div className="text-xs text-[#76715A] bg-[#EDEAE3]/30 rounded-lg p-3 space-y-1">
        <div><strong>Formats acceptés :</strong> JPG, PNG, SVG, WebP</div>
        <div><strong>Taille max :</strong> {(maxSize / (1024 * 1024)).toFixed(1)} MB</div>
        <div><strong>Dimensions max :</strong> 2000 x 2000 px</div>
      </div>

      {currentImageUrl && (
        <>
          <Separator />
          <label className="flex items-center justify-center w-full py-3 border border-[#EDEAE3] rounded-lg cursor-pointer hover:bg-[#EDEAE3]/30 hover:border-[#76715A] transition-colors">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#76715A]" />
              <span className="text-sm font-medium text-[#76715A]">Remplacer le logo</span>
            </div>
            <input
              type="file"
              className="hidden"
              accept={acceptedFormats.join(',')}
              onChange={handleFileChange}
            />
          </label>
        </>
      )}
    </div>
  )

  // Panel Color fusionné avec Cadre (V0 style)
  const renderColorPanel = () => (
    <div className="space-y-3">
      {/* COULEUR DU TEXTE */}
      <p className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Couleur du texte</p>
      
      {projectColors.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {projectColors.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange?.(c)}
              className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${c === color ? 'border-[#76715A]' : 'border-[#EDEAE3]'}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color || '#000000'}
          onChange={(e) => onColorChange?.(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-[#EDEAE3]"
        />
        <span className="text-xs font-mono text-[#76715A]">{color}</span>
      </div>

      <Separator />

      {/* FOND - Toggle */}
      <button 
        onClick={onCadreToggle}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
      >
        <div className={`w-3 h-3 rounded-full border-2 border-[#76715A] transition-colors ${cadre?.enabled ? 'bg-[#76715A]' : 'bg-white'}`} />
        <span className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Fond</span>
      </button>

      {cadre?.enabled && (
        <div className="pl-5 space-y-2">
          <div className="grid grid-cols-5 gap-2">
            {projectColors.map((c) => (
              <button
                key={c}
                onClick={() => onCadreChange?.({ ...cadre, backgroundColor: c })}
                className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${c === cadre.backgroundColor ? 'border-[#76715A]' : 'border-[#EDEAE3]'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cadre.backgroundColor}
              onChange={(e) => onCadreChange?.({ ...cadre, backgroundColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-[#EDEAE3]"
            />
            <span className="text-xs font-mono text-[#76715A]">{cadre.backgroundColor}</span>
          </div>
        </div>
      )}

      <Separator />

      {/* BORDURE - Toggle */}
      <button
        onClick={() => onCadreChange?.({ 
          ...cadre!, 
          border: { 
            ...(cadre!.border || { color: '#2F2F2E', width: 2 }), 
            enabled: !cadre!.border?.enabled 
          } 
        })}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
      >
        <div className={`w-3 h-3 rounded-full border-2 border-[#76715A] transition-colors ${cadre?.border?.enabled ? 'bg-[#76715A]' : 'bg-white'}`} />
        <span className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Bordure</span>
      </button>

      {cadre?.border?.enabled && (
        <div className="pl-5 space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {projectColors.map((c) => (
              <button
                key={c}
                onClick={() => onCadreChange?.({ ...cadre, border: { ...cadre.border!, color: c } })}
                className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${c === cadre.border?.color ? 'border-[#76715A]' : 'border-[#EDEAE3]'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#76715A]">Épaisseur</span>
              <span className="text-xs font-mono text-[#2F2F2E]">{cadre.border?.width || 2}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={cadre.border?.width || 2}
              onChange={(e) => onCadreChange?.({ ...cadre, border: { ...cadre.border!, width: parseInt(e.target.value) } })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#76715A' }}
            />
          </div>
        </div>
      )}

      <Separator />

      {/* ARRONDI - Toggle */}
      <button
        onClick={() => onCadreChange?.({ 
          ...cadre!, 
          borderRadiusEnabled: !cadre!.borderRadiusEnabled,
          borderRadius: cadre!.borderRadiusEnabled ? 0 : (cadre!.borderRadius || 8)
        })}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
      >
        <div className={`w-3 h-3 rounded-full border-2 border-[#76715A] transition-colors ${cadre?.borderRadiusEnabled ? 'bg-[#76715A]' : 'bg-white'}`} />
        <span className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Arrondi</span>
      </button>

      {cadre?.borderRadiusEnabled && (
        <div className="pl-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#76715A]">Rayon</span>
            <span className="text-xs font-mono text-[#2F2F2E]">{cadre.borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={cadre.borderRadius}
            onChange={(e) => onCadreChange?.({ ...cadre, borderRadius: parseInt(e.target.value) })}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#76715A' }}
          />
        </div>
      )}

      <Separator />

      {/* OMBRE - Toggle */}
      <button
        onClick={() => onCadreChange?.({ 
          ...cadre!, 
          shadow: { 
            ...(cadre!.shadow || { blur: 8, offsetY: 4, color: 'rgba(0,0,0,0.15)' }), 
            enabled: !cadre!.shadow?.enabled 
          } 
        })}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
      >
        <div className={`w-3 h-3 rounded-full border-2 border-[#76715A] transition-colors ${cadre?.shadow?.enabled ? 'bg-[#76715A]' : 'bg-white'}`} />
        <span className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Ombre</span>
      </button>

      {cadre?.shadow?.enabled && (
        <div className="pl-5 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#76715A]">Flou</span>
              <span className="text-xs font-mono text-[#2F2F2E]">{cadre.shadow.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={cadre.shadow.blur}
              onChange={(e) => onCadreChange?.({ ...cadre, shadow: { ...cadre.shadow!, blur: parseInt(e.target.value) } })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#76715A' }}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#76715A]">Décalage Y</span>
              <span className="text-xs font-mono text-[#2F2F2E]">{cadre.shadow.offsetY}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={cadre.shadow.offsetY}
              onChange={(e) => onCadreChange?.({ ...cadre, shadow: { ...cadre.shadow!, offsetY: parseInt(e.target.value) } })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#76715A' }}
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderAlignmentPanel = () => (
    <div className="space-y-3">
      <p className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Alignement</p>
      
      {/* Container inline avec séparateurs V0 */}
      <div className="flex rounded-lg border border-[#D6CCAF] overflow-hidden">
        <button
          onClick={() => onAlignChange?.('left')}
          className={`flex-1 py-2 flex items-center justify-center transition-colors ${textAlign === 'left' ? 'bg-[#EDEAE3]' : 'hover:bg-[#EDEAE3]'}`}
        >
          <AlignLeft className="w-4 h-4 text-[#76715A]" />
        </button>
        <div className="w-px bg-[#D6CCAF]" />
        <button
          onClick={() => onAlignChange?.('center')}
          className={`flex-1 py-2 flex items-center justify-center transition-colors ${textAlign === 'center' ? 'bg-[#EDEAE3]' : 'hover:bg-[#EDEAE3]'}`}
        >
          <AlignCenter className="w-4 h-4 text-[#76715A]" />
        </button>
        <div className="w-px bg-[#D6CCAF]" />
        <button
          onClick={() => onAlignChange?.('right')}
          className={`flex-1 py-2 flex items-center justify-center transition-colors ${textAlign === 'right' ? 'bg-[#EDEAE3]' : 'hover:bg-[#EDEAE3]'}`}
        >
          <AlignRight className="w-4 h-4 text-[#76715A]" />
        </button>
        <div className="w-px bg-[#D6CCAF]" />
        <button
          onClick={() => onAlignChange?.('justify')}
          className={`flex-1 py-2 flex items-center justify-center transition-colors ${textAlign === 'justify' ? 'bg-[#EDEAE3]' : 'hover:bg-[#EDEAE3]'}`}
        >
          <AlignJustify className="w-4 h-4 text-[#76715A]" />
        </button>
      </div>
    </div>
  )

  const renderFontPanel = () => {
    const currentSize = fontSize || 16
    const minSize = 12
    const maxSize = 48

    return (
      <div className="space-y-4">
        {/* SECTION POLICE */}
        <div>
          <p className="text-xs text-[#76715A] mb-2 uppercase tracking-wide font-medium">Police</p>
          <div className="space-y-1">
            {FONTS.map((f) => (
              <button
                key={f.value}
                onClick={() => onFontChange?.(f.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${font === f.value ? 'border-[#76715A] bg-[#EDEAE3]/30' : 'border-[#EDEAE3] hover:border-[#76715A] hover:bg-[#EDEAE3]/30'}`}
              >
                <span style={{ fontFamily: f.value }} className="text-sm text-[#2F2F2E]">
                  {f.name}
                </span>
                <span style={{ fontFamily: f.value }} className="text-xs text-[#76715A]">
                  Aa
                </span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* SECTION TAILLE */}
        <div>
          <p className="text-xs text-[#76715A] mb-2 uppercase tracking-wide font-medium">Taille</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSizeChange?.(Math.max(minSize, currentSize - 2))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EDEAE3] hover:bg-[#EDEAE3] transition-colors text-[#2F2F2E]"
            >
              −
            </button>
            <input
              type="range"
              min={minSize}
              max={maxSize}
              value={currentSize}
              onChange={(e) => onSizeChange?.(parseInt(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#76715A' }}
            />
            <button
              onClick={() => onSizeChange?.(Math.min(maxSize, currentSize + 2))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EDEAE3] hover:bg-[#EDEAE3] transition-colors text-[#2F2F2E]"
            >
              +
            </button>
          </div>
          <div className="text-center mt-1">
            <span className="text-xs font-mono text-[#2F2F2E]">{currentSize}px</span>
          </div>
        </div>
      </div>
    )
  }

  const renderCadrePanel = () => {
    if (!cadre) return null

    return (
      <div className="space-y-3">
        {onImageRemove && (
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                // anti double-clic simple
                if ((window as any).__sp_del_guard) return
                ;(window as any).__sp_del_guard = true
                setTimeout(() => { (window as any).__sp_del_guard = false }, 400)
                onImageRemove()
              }}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Supprimer l'image"
              aria-label="Supprimer l'image"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
        {!isLogoMode && (
          <>
            <button 
              onClick={onCadreToggle}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className={`w-3 h-3 rounded-full border-2 border-[#76715A] transition-colors ${cadre?.enabled ? 'bg-[#76715A]' : 'bg-white'}`} />
              <p className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Fond</p>
            </button>

            {cadre?.enabled && (
          <>
            <div className="grid grid-cols-5 gap-2">
              {projectColors.map((c) => (
                <button
                  key={c}
                  onClick={() => onCadreChange?.({ ...cadre, backgroundColor: c })}
                  className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${c === cadre.backgroundColor ? 'border-[#76715A]' : 'border-[#EDEAE3]'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cadre.backgroundColor}
                onChange={(e) => onCadreChange?.({ ...cadre, backgroundColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-[#EDEAE3]"
              />
              <span className="text-xs font-mono text-[#76715A]">{cadre.backgroundColor}</span>
            </div>
          </>
            )}
          </>
        )}

        {!isLogoMode && <Separator />}
        
        {/* Bouton Bordure */}
        <button
          onClick={() => onCadreChange?.({ 
            ...cadre!, 
            border: { 
              ...(cadre!.border || {}), 
              enabled: !cadre!.border?.enabled,
              color: cadre!.border?.color || '#000000',
              width: cadre!.border?.width || 2
            } 
          })}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <div className={`w-3 h-3 rounded-full border-2 border-[#76715A] transition-colors ${cadre.border?.enabled ? 'bg-[#76715A]' : 'bg-white'}`} />
          <p className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Bordure</p>
        </button>

        {/* Réglages Bordure - affichés seulement si bordure activée */}
        {cadre.border?.enabled && (() => {
          const border = cadre.border || { enabled: false, color: '#000000', width: 2 }
          
          return (
            <>
              <div className="grid grid-cols-5 gap-2">
                {projectColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => onCadreChange?.({ 
                      ...cadre, 
                      border: { ...border, color: c } 
                    })}
                    className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${c === border.color ? 'border-[#76715A]' : 'border-[#EDEAE3]'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={border.color}
                  onChange={(e) => onCadreChange?.({ 
                    ...cadre, 
                    border: { ...border, color: e.target.value } 
                  })}
                  className="w-8 h-8 rounded cursor-pointer border border-[#EDEAE3]"
                />
                <span className="text-xs font-mono text-[#76715A]">{border.color}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#76715A]">Épaisseur</span>
                  <span className="text-xs font-mono text-[#2F2F2E]">{border.width}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={border.width}
                  onChange={(e) => onCadreChange?.({ 
                    ...cadre, 
                    border: { ...border, width: parseInt(e.target.value) } 
                  })}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: '#76715A' }}
                />
              </div>
            </>
          )
        })()}

        {/* Section Ombre - pour bouton uniquement */}
        {cadre?.shadow !== undefined && (
          <>
            <Separator />
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Ombre</p>
              <button
                onClick={() => onCadreChange?.({
                  shadow: {
                    ...cadre.shadow!,
                    enabled: !cadre.shadow?.enabled
                  }
                })}
                className={cadre.shadow?.enabled
                  ? 'px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-[#76715A] text-white'
                  : 'px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-[#EDEAE3] text-[#76715A]'}
              >
                {cadre.shadow?.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {cadre.shadow?.enabled && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#76715A]">Flou</span>
                    <span className="text-xs font-mono text-[#2F2F2E]">{cadre.shadow.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={cadre.shadow.blur}
                    onChange={(e) => onCadreChange?.({
                      shadow: {
                        ...cadre.shadow!,
                        blur: Number(e.target.value)
                      }
                    })}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: '#76715A' }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#76715A]">Décalage Y</span>
                    <span className="text-xs font-mono text-[#2F2F2E]">{cadre.shadow.offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={cadre.shadow.offsetY}
                    onChange={(e) => onCadreChange?.({
                      shadow: {
                        ...cadre.shadow!,
                        offsetY: Number(e.target.value)
                      }
                    })}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: '#76715A' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#76715A] block">Couleur</label>
                  <div className="grid grid-cols-5 gap-2">
                    {projectColors.map((c) => {
                      // Extraire la couleur hex de l'ombre actuelle pour comparaison
                      const currentShadowColor = cadre.shadow?.color || 'rgba(0, 0, 0, 0.15)'
                      const hexMatch = currentShadowColor.match(/#[0-9A-Fa-f]{6}/)
                      const currentHex = hexMatch ? hexMatch[0] : '#000000'
                      const isSelected = currentShadowColor.includes(c) || currentHex === c
                      
                      return (
                        <button
                          key={c}
                          onClick={() => {
                            // Extraire alpha existant ou utiliser 0.15 par défaut
                            const alphaMatch = currentShadowColor.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([^)]+)\)/)
                            const alpha = alphaMatch ? alphaMatch[1].trim() : '0.15'
                            // Convertir hex en rgb
                            const r = parseInt(c.slice(1, 3), 16)
                            const g = parseInt(c.slice(3, 5), 16)
                            const b = parseInt(c.slice(5, 7), 16)
                            const newColor = `rgba(${r}, ${g}, ${b}, ${alpha})`
                            onCadreChange?.({
                              shadow: {
                                ...cadre.shadow!,
                                color: newColor
                              }
                            })
                          }}
                          className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${isSelected ? 'border-[#76715A]' : 'border-[#EDEAE3]'}`}
                          style={{ backgroundColor: c }}
                        />
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(() => {
                        const currentColor = cadre.shadow?.color || 'rgba(0, 0, 0, 0.15)'
                        const rgbMatch = currentColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
                        if (rgbMatch) {
                          const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
                          const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
                          const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
                          return `#${r}${g}${b}`
                        }
                        return '#000000'
                      })()}
                      onChange={(e) => {
                        const currentColor = cadre.shadow?.color || 'rgba(0, 0, 0, 0.15)'
                        const alphaMatch = currentColor.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([^)]+)\)/)
                        const alpha = alphaMatch ? alphaMatch[1].trim() : '0.15'
                        const r = parseInt(e.target.value.slice(1, 3), 16)
                        const g = parseInt(e.target.value.slice(3, 5), 16)
                        const b = parseInt(e.target.value.slice(5, 7), 16)
                        const newColor = `rgba(${r}, ${g}, ${b}, ${alpha})`
                        onCadreChange?.({
                          shadow: {
                            ...cadre.shadow!,
                            color: newColor
                          }
                        })
                      }}
                      className="w-8 h-8 rounded cursor-pointer border border-[#EDEAE3]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(() => {
                        const currentColor = cadre.shadow?.color || 'rgba(0, 0, 0, 0.15)'
                        // Extraire l'alpha de rgba(r, g, b, alpha) - chercher le dernier paramètre après la 3ème virgule
                        const rgbaMatch = currentColor.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([^)]+)\)/)
                        if (rgbaMatch) {
                          const alpha = parseFloat(rgbaMatch[1].trim())
                          return Math.round(alpha * 100)
                        }
                        // Si format hex ou autre, retourner 15 par défaut
                        return 15
                      })()}
                      onChange={(e) => {
                        const currentColor = cadre.shadow?.color || 'rgba(0, 0, 0, 0.15)'
                        const rgbMatch = currentColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
                        if (rgbMatch) {
                          const r = rgbMatch[1].trim()
                          const g = rgbMatch[2].trim()
                          const b = rgbMatch[3].trim()
                          const alpha = (Number(e.target.value) / 100).toFixed(2)
                          const newColor = `rgba(${r}, ${g}, ${b}, ${alpha})`
                          onCadreChange?.({
                            shadow: {
                              ...cadre.shadow!,
                              color: newColor
                            }
                          })
                        }
                      }}
                      className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#76715A' }}
                    />
                    <span className="text-xs font-mono text-[#76715A] w-12 text-right">
                      {(() => {
                        const currentColor = cadre.shadow?.color || 'rgba(0, 0, 0, 0.15)'
                        // Extraire l'alpha de rgba(r, g, b, alpha) - chercher le dernier paramètre après la 3ème virgule
                        const rgbaMatch = currentColor.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([^)]+)\)/)
                        if (rgbaMatch) {
                          const alpha = parseFloat(rgbaMatch[1].trim())
                          return Math.round(alpha * 100) + '%'
                        }
                        return '15%'
                      })()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <Separator />
        
        {/* Bouton Arrondi */}
        <button
          onClick={() => onCadreChange?.({ 
            ...cadre!, 
            borderRadiusEnabled: !cadre!.borderRadiusEnabled,
            borderRadius: cadre!.borderRadiusEnabled ? 0 : (cadre!.borderRadius || 8)
          })}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <div className={`w-3 h-3 rounded-full border-2 border-[#76715A] transition-colors ${cadre.borderRadiusEnabled ? 'bg-[#76715A]' : 'bg-white'}`} />
          <p className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Arrondi</p>
        </button>

        {/* Réglages Arrondi - affichés seulement si arrondi activé */}
        {cadre.borderRadiusEnabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#76715A]">Arrondi</span>
              <span className="text-xs font-mono text-[#2F2F2E]">{cadre!.borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={cadre!.borderRadius}
              onChange={(e) => onCadreChange?.({ ...cadre!, borderRadius: parseInt(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#76715A' }}
            />
          </div>
        )}

        <Separator />
        
        {/* Bouton Toggle "Synchroniser avec les autres images" */}
        <button
          onClick={() => onToggleSyncWithGlobal?.()}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <div className={`w-3 h-3 rounded-full border-2 border-[#76715A] transition-colors ${cadre?.syncWithGlobal !== false ? 'bg-[#76715A]' : 'bg-white'}`} />
          <p className="text-xs text-[#76715A] uppercase tracking-wide font-medium">Synchroniser avec les autres images</p>
        </button>
        
        {cadre?.syncWithGlobal !== false && (
          <div className="text-xs text-[#76715A] bg-[#EDEAE3]/30 rounded-lg p-2">
            Cette image suit les réglages globaux. Décochez pour la rendre indépendante.
          </div>
        )}
      </div>
    )
  }

  if (!position) return null
  if (!mounted) return null

  // Hauteur approximative du FloatingToolbar (py-2 = 8px top + 8px bottom + h-8 = 32px pour les éléments = ~48px)
  const FLOATING_TOOLBAR_HEIGHT = 48

  const panelContent = (
    <div
      data-side-panel="true"
      style={{
        position: 'fixed',
        top: (position.top + FLOATING_TOOLBAR_HEIGHT + 10) + 'px', // 10px en dessous du FloatingToolbar
        left: position.left + 'px', // Aligné à gauche avec le FloatingToolbar
        zIndex: 10000
      }}
      className="w-80 bg-white border border-[#D6CCAF] rounded-xl shadow-lg p-4"
    >
      {type === 'upload' && renderUploadPanel()}
      {type === 'color' && renderColorPanel()}
      {type === 'alignment' && renderAlignmentPanel()}
      {type === 'cadre' && renderCadrePanel()}
      {type === 'logo-alignment' && renderLogoAlignmentPanel()}
      {type === 'font' && renderFontPanel()}
    </div>
  )

  // Utiliser un portail pour rendre le SidePanel directement dans le body
  // Cela évite les problèmes d'overflow-hidden ou transform sur les parents
  return createPortal(panelContent, document.body)
}
