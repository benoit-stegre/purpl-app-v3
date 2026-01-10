'use client'

import { useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Upload, X, Trash2 } from 'lucide-react'

interface SidePanelProps {
  type: 'color' | 'alignment' | 'cadre' | 'upload' | 'logo-alignment'
  position?: { top: number; left: number }
  color?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  projectColors?: string[]
  cadre?: {
    enabled: boolean
    backgroundColor: string
    borderRadius: number
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
  
  onColorChange?: (color: string) => void
  onAlignChange?: (align: 'left' | 'center' | 'right' | 'justify') => void
  onCadreToggle?: () => void
  onCadreChange?: (cadre: any) => void
  onToggleSyncWithGlobal?: () => void  // ✅ Nouveau : toggle synchronisation avec réglages globaux
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
  onColorChange,
  onAlignChange,
  onCadreToggle,
  onCadreChange,
  onToggleSyncWithGlobal,
  onClose
}: SidePanelProps) {
  const Separator = () => (
    <div className="h-px w-full bg-gray-400 my-3" />
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
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Alignement du logo
        </div>

        <div className="grid grid-cols-3 gap-2">
          {alignments.map((align) => (
            <button
              key={align.value}
              onClick={() => onLogoAlignChange?.(align.value)}
              className={
                'p-4 rounded flex flex-col items-center justify-center border-2 hover:bg-gray-50 transition-colors ' +
                (logoAlignment === align.value 
                  ? 'bg-blue-50 border-blue-500' 
                  : 'border-gray-300')
              }
              title={align.label}
            >
              <div className="text-2xl mb-2 text-gray-700">{align.icon}</div>
              <span className="text-xs text-gray-600">{align.label}</span>
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
          Alignement horizontal du logo dans l'espace disponible.
        </div>
      </div>
    )
  }
const renderUploadPanel = () => (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Modifier le logo</div>

      {currentImageUrl ? (
        <div className="relative">
          <img 
            src={currentImageUrl} 
            alt="Logo actuel" 
            className="w-full h-48 object-contain bg-gray-50 rounded-lg border-2 border-gray-300"
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
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Cliquer pour uploader</p>
            <p className="text-xs text-gray-400 mt-1">
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
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {uploadError}
        </div>
      )}

      <div className="text-xs text-gray-500 bg-gray-50 rounded p-3 space-y-1">
        <div><strong>Formats acceptés :</strong> JPG, PNG, SVG, WebP</div>
        <div><strong>Taille max :</strong> {(maxSize / (1024 * 1024)).toFixed(1)} MB</div>
        <div><strong>Dimensions max :</strong> 2000 x 2000 px</div>
      </div>

      {currentImageUrl && (
        <>
          <Separator />
          <label className="flex items-center justify-center w-full py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Remplacer le logo</span>
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

  const renderColorPanel = () => (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Couleur du texte</div>
      
      {projectColors.length > 0 && (
        <div className="grid grid-cols-6 gap-2">
          {projectColors.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange?.(c)}
              className={'w-8 h-8 rounded border-2 hover:scale-110 transition-transform ' + (c === color ? 'border-blue-500' : 'border-gray-300')}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange?.(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border-2 border-gray-400"
        />
        <span className="text-sm font-mono text-gray-600">{color}</span>
      </div>
    </div>
  )

  const renderAlignmentPanel = () => (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Alignement</div>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onAlignChange?.('left')}
          className={'p-3 rounded hover:bg-gray-50 flex items-center justify-center border-2 ' + (textAlign === 'left' ? 'bg-blue-100 border-blue-500' : 'border-gray-400')}
        >
          <AlignLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={() => onAlignChange?.('center')}
          className={'p-3 rounded hover:bg-gray-50 flex items-center justify-center border-2 ' + (textAlign === 'center' ? 'bg-blue-100 border-blue-500' : 'border-gray-400')}
        >
          <AlignCenter className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={() => onAlignChange?.('right')}
          className={'p-3 rounded hover:bg-gray-50 flex items-center justify-center border-2 ' + (textAlign === 'right' ? 'bg-blue-100 border-blue-500' : 'border-gray-400')}
        >
          <AlignRight className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={() => onAlignChange?.('justify')}
          className={'p-3 rounded hover:bg-gray-50 flex items-center justify-center border-2 ' + (textAlign === 'justify' ? 'bg-blue-100 border-blue-500' : 'border-gray-400')}
        >
          <AlignJustify className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  )

  const renderCadrePanel = () => {
    if (!cadre) return null
    
    const showSharedParams = cadre.enabled || cadre.border?.enabled || cadre.borderRadiusEnabled

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
              className="p-2 rounded hover:bg-red-50 transition-colors"
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
              <div className={'w-2.5 h-2.5 rounded-full border-2 border-blue-500 transition-colors ' + (cadre?.enabled ? 'bg-blue-500' : 'bg-white')} />
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Fond</div>
            </button>

            {cadre?.enabled && (
          <>
            <div className="grid grid-cols-6 gap-2">
              {projectColors.map((c) => (
                <button
                  key={c}
                  onClick={() => onCadreChange?.({ ...cadre, backgroundColor: c })}
                  className={'w-8 h-8 rounded border-2 hover:scale-110 transition-transform ' + (c === cadre.backgroundColor ? 'border-blue-500' : 'border-gray-300')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cadre.backgroundColor}
                onChange={(e) => onCadreChange?.({ ...cadre, backgroundColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-2 border-gray-400"
              />
              <span className="text-sm font-mono text-gray-600">{cadre.backgroundColor}</span>
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
          <div className={'w-2.5 h-2.5 rounded-full border-2 border-blue-500 transition-colors ' + (cadre.border?.enabled ? 'bg-blue-500' : 'bg-white')} />
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Bordure</div>
        </button>

        {/* Réglages Bordure - affichés seulement si bordure activée */}
        {cadre.border?.enabled && (() => {
          const border = cadre.border || { enabled: false, color: '#000000', width: 2 }
          
          return (
            <>
              <div className="grid grid-cols-6 gap-2">
                {projectColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => onCadreChange?.({ 
                      ...cadre, 
                      border: { ...border, color: c } 
                    })}
                    className={'w-8 h-8 rounded border-2 hover:scale-110 transition-transform ' + (c === border.color ? 'border-blue-500' : 'border-gray-300')}
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
                  className="w-10 h-10 rounded cursor-pointer border-2 border-gray-400"
                />
                <span className="text-sm font-mono text-gray-600">{border.color}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Épaisseur</span>
                  <span className="text-xs font-mono text-gray-700">{border.width}px</span>
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
                  className="w-full"
                  style={{ accentColor: '#3B82F6' }}
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
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Ombre</label>
              <button
                onClick={() => onCadreChange?.({
                  shadow: {
                    ...cadre.shadow!,
                    enabled: !cadre.shadow?.enabled
                  }
                })}
                className={cadre.shadow?.enabled
                  ? 'px-3 py-1 rounded text-xs font-medium transition-colors bg-blue-500 text-white'
                  : 'px-3 py-1 rounded text-xs font-medium transition-colors bg-gray-200 text-gray-700'}
              >
                {cadre.shadow?.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {cadre.shadow?.enabled && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Flou</span>
                    <span className="text-xs font-mono text-gray-700">{cadre.shadow.blur}px</span>
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
                    className="w-full"
                    style={{ accentColor: '#3B82F6' }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Décalage Y</span>
                    <span className="text-xs font-mono text-gray-700">{cadre.shadow.offsetY}px</span>
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
                    className="w-full"
                    style={{ accentColor: '#3B82F6' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-600 block">Couleur</label>
                  <div className="grid grid-cols-6 gap-2">
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
                          className={'w-8 h-8 rounded border-2 hover:scale-110 transition-transform ' + (isSelected ? 'border-blue-500' : 'border-gray-300')}
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
                      className="w-10 h-10 rounded cursor-pointer border-2 border-gray-400"
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
                      className="flex-1"
                      style={{ accentColor: '#3B82F6' }}
                    />
                    <span className="text-xs font-mono text-gray-600 w-12 text-right">
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
          <div className={'w-2.5 h-2.5 rounded-full border-2 border-blue-500 transition-colors ' + (cadre.borderRadiusEnabled ? 'bg-blue-500' : 'bg-white')} />
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Arrondi</div>
        </button>

        {/* Réglages Arrondi - affichés seulement si arrondi activé */}
        {cadre.borderRadiusEnabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Arrondi</span>
              <span className="text-xs font-mono text-gray-700">{cadre!.borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={cadre!.borderRadius}
              onChange={(e) => onCadreChange?.({ ...cadre!, borderRadius: parseInt(e.target.value) })}
              className="w-full"
              style={{ accentColor: '#3B82F6' }}
            />
          </div>
        )}

        <Separator />
        
        {/* Bouton Toggle "Synchroniser avec les autres images" */}
        <button
          onClick={() => onToggleSyncWithGlobal?.()}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <div className={'w-2.5 h-2.5 rounded-full border-2 border-blue-500 transition-colors ' + (cadre?.syncWithGlobal !== false ? 'bg-blue-500' : 'bg-white')} />
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Synchroniser avec les autres images</div>
        </button>
        
        {cadre?.syncWithGlobal !== false && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            Cette image suit les réglages globaux. Décochez pour la rendre indépendante.
          </div>
        )}
      </div>
    )
  }

  if (!position) return null

  // Hauteur approximative du FloatingToolbar (py-2 = 8px top + 8px bottom + h-8 = 32px pour les éléments = ~48px)
  const FLOATING_TOOLBAR_HEIGHT = 48

  return (
    <div
      style={{
        position: 'fixed',
        top: (position.top + FLOATING_TOOLBAR_HEIGHT + 10) + 'px', // 10px en dessous du FloatingToolbar
        left: position.left + 'px', // Aligné à gauche avec le FloatingToolbar
        zIndex: 10000
      }}
      className="w-80 bg-white border-2 border-gray-400 rounded-lg shadow-xl p-4"
    >
      {type === 'upload' && renderUploadPanel()}
      {type === 'color' && renderColorPanel()}
      {type === 'alignment' && renderAlignmentPanel()}
      {type === 'cadre' && renderCadrePanel()}
      {type === 'logo-alignment' && renderLogoAlignmentPanel()}
    </div>
  )
}