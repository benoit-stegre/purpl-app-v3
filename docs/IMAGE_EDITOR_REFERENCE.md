# 📸 Guide de Référence : Système ImageEditor (Resize & Crop)

**Version :** 1.0  
**Date :** 2025-01-04  
**Auteur :** Documentation technique PURPL V3

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Types TypeScript](#types-typescript)
4. [Composants disponibles](#composants-disponibles)
5. [Guide d'intégration pas à pas](#guide-dintégration-pas-à-pas)
6. [Gestion de la synchronisation](#gestion-de-la-synchronisation)
7. [Exemples complets](#exemples-complets)
8. [Bonnes pratiques](#bonnes-pratiques)

---

## 🎯 Vue d'ensemble

Le système `ImageEditor` est un composant réutilisable qui gère :
- ✅ **Resize** : Redimensionnement proportionnel via une poignée (coin bas-droite)
- ✅ **Crop** : Recadrage via un modal plein écran avec `react-advanced-cropper`
- ✅ **Bordure** : Gestion des bordures avec couleur et épaisseur
- ✅ **Arrondi** : Gestion des coins arrondis (activé/désactivé indépendamment)
- ✅ **Alignement** : Alignement horizontal (gauche, centre, droite)
- ✅ **Synchronisation** : Synchronisation des réglages avec les autres images

### Cas d'usage actuels
- `LogoHeaderInlineEditor` : Gestion des logos (multiples images)
- `PhotoInlineEditor` : Gestion de la photo principale (image unique)

---

## 🏗️ Architecture

### Structure des fichiers

```
components/
  shared/
    ImageEditor/
      ├── index.ts              # Exports publics
      ├── ImageEditor.tsx       # Composant principal (orchestrateur)
      ├── ImageCropModal.tsx    # Modal de crop (react-advanced-cropper)
      ├── ImageResizeHandle.tsx # Poignée de resize
      ├── ImageDisplay.tsx      # Affichage de l'image avec crop appliqué
      ├── types.ts              # Types TypeScript locaux
      └── utils.ts              # Fonctions utilitaires

types/
  design-v6.ts                  # Types globaux (ImageItemBase, CadreConfig)
```

### Flux de données

```
ImageEditor (orchestrateur)
  ├── ImageDisplay (affichage)
  ├── ImageResizeHandle (resize)
  └── ImageCropModal (crop)
```

---

## 📐 Types TypeScript

### 1. Interface de base (`ImageItemBase`)

Toutes les images doivent étendre cette interface :

```typescript
// types/design-v6.ts
export interface ImageItemBase {
  id: string
  url: string
  
  // Dimensions source (immuables - image originale)
  sourceWidth: number
  sourceHeight: number
  
  // Dimensions d'affichage (modifiables via resize)
  displayWidth: number
  displayHeight: number
  
  // Zone de crop (coordonnées en pixels source)
  crop: {
    x: number      // Position X dans l'image source
    y: number      // Position Y dans l'image source
    width: number  // Largeur du viewport
    height: number // Hauteur du viewport
  }
}
```

### 2. Configuration du cadre (`CadreConfig`)

```typescript
// types/design-v6.ts
export interface CadreConfig {
  enabled: boolean
  backgroundColor: string
  borderRadius: number
  borderRadiusEnabled?: boolean  // ✅ Contrôle si l'arrondi est activé
  padding?: number
  syncWithGlobal?: boolean     // ✅ Si true, suit les réglages globaux
  border?: {
    enabled: boolean
    color: string
    width: number
  }
}
```

### 3. Exemple d'interface complète

```typescript
// Pour une nouvelle rubrique d'image
export interface MaNouvelleImageItem extends ImageItemBase {
  // Propriétés spécifiques à votre rubrique
  order?: number              // Si plusieurs images (optionnel)
  alignment?: 'left' | 'center' | 'right'
  cadre?: CadreConfig
  // ... autres propriétés spécifiques
}
```

### 4. Valeurs par défaut

```typescript
const DEFAULT_IMAGE_CADRE: CadreConfig = {
  enabled: false,
  backgroundColor: 'transparent',
  borderRadius: 8,
  borderRadiusEnabled: false,  // ✅ Par défaut, arrondi désactivé
  syncWithGlobal: true,        // ✅ Par défaut, synchronisé
  padding: 16,
  border: {
    enabled: false,
    color: '#000000',
    width: 2
  }
}
```

---

## 🧩 Composants disponibles

### 1. `ImageEditor` (Composant principal)

**Import :**
```typescript
import { ImageEditor } from '@/components/shared/ImageEditor'
```

**Props :**
```typescript
interface ImageEditorProps {
  image: ImageItem              // L'image à éditer (doit étendre ImageItemBase)
  onUpdate: (updatedImage: ImageItem) => void
  maxWidth?: number             // Défaut: 309px
  minWidth?: number             // Défaut: 50px
  minHeight?: number            // Défaut: 30px
  isActive?: boolean            // Si true, affiche les contrôles
  onActivate?: () => void       // Callback au clic sur l'image
  onDeactivate?: () => void     // Callback au clic extérieur
  className?: string            // Classes CSS additionnelles
}
```

**Utilisation :**
```tsx
<ImageEditor
  image={monImage}
  onUpdate={handleImageUpdate}
  maxWidth={309}
  isActive={isActive}
  onActivate={handleActivate}
  onDeactivate={handleDeactivate}
  className="inline-block"
/>
```

### 2. Autres composants (usage avancé)

- `ImageDisplay` : Affichage seul (sans contrôles)
- `ImageCropModal` : Modal de crop (géré automatiquement par ImageEditor)
- `ImageResizeHandle` : Poignée de resize (gérée automatiquement)

---

## 🚀 Guide d'intégration pas à pas

### Étape 1 : Définir le type dans `design-v6.ts`

```typescript
// types/design-v6.ts

// 1. Créer l'interface qui étend ImageItemBase
export interface MaNouvelleImageItem extends ImageItemBase {
  alignment?: 'left' | 'center' | 'right'
  cadre?: CadreConfig
  // ... autres propriétés spécifiques
}

// 2. Ajouter au DesignConfigV6
export interface DesignConfigV6 {
  // ... autres propriétés
  maNouvelleImage?: MaNouvelleImageItem | MaNouvelleImageItem[]  // Image unique ou multiple
}
```

### Étape 2 : Créer le composant InlineEditor

```typescript
// components/builder-v6/MaNouvelleImageInlineEditor.tsx
'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { DesignConfigV6, MaNouvelleImageItem, CadreConfig } from '@/types/design-v6'
import { ImageEditor } from '@/components/shared/ImageEditor'
import FloatingToolbar from './FloatingToolbar'
import SidePanel from './SidePanel'
import { useInlineEditor } from '@/hooks/useInlineEditor'
import { addColorToPalette } from '@/lib/addColorToPalette'
import { compressImageWithMetadata } from '@/lib/utils/image'
import ConfirmModal from '@/components/shared/ConfirmModal'

// ✅ Valeurs par défaut
const DEFAULT_IMAGE_CADRE: CadreConfig = {
  enabled: false,
  backgroundColor: 'transparent',
  borderRadius: 8,
  borderRadiusEnabled: false,
  syncWithGlobal: true,  // ✅ Important : synchronisé par défaut
  padding: 16,
  border: {
    enabled: false,
    color: '#000000',
    width: 2
  }
}

interface MaNouvelleImageInlineEditorProps {
  designConfig: DesignConfigV6
  onUpdate: (updates: Partial<DesignConfigV6>) => void
  concertationId: string
}

export default function MaNouvelleImageInlineEditor({
  designConfig,
  onUpdate,
  concertationId
}: MaNouvelleImageInlineEditorProps) {
  
  const containerRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  
  const { 
    activeRubrique, 
    activateRubrique, 
    deactivateRubrique,
    toolbarPosition, 
    setToolbarPosition,
    sidePanelOpen, 
    setSidePanelOpen,
    sidePanelType,
    setSidePanelType
  } = useInlineEditor()

  const [uploading, setUploading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [tempBackgroundColor, setTempBackgroundColor] = useState<string | null>(null)
  const [tempBorderColor, setTempBorderColor] = useState<string | null>(null)
  
  const maxWidth = 309  // Largeur max disponible
  const isActive = activeRubrique === 'maNouvelleImage'
  const currentImage = designConfig.maNouvelleImage  // Image unique OU tableau[0] si multiple

  // ✅ Gestion de l'activation
  const handleContainerClick = () => {
    if (!isActive) {
      const phonePreview = document.querySelector('[style*="width: 395px"]')
      if (phonePreview) {
        const phoneRect = phonePreview.getBoundingClientRect()
        setToolbarPosition({
          top: phoneRect.top - 80,
          left: phoneRect.right - 200
        })
      }
      activateRubrique('maNouvelleImage')
    }
  }

  // ✅ Gestion de l'upload
  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await compressImageWithMetadata(file, 2000, 2000)
      const compressedFile = new File([result.blob], file.name, { type: 'image/webp' })

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('concertationId', concertationId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      const newImage: MaNouvelleImageItem = {
        id: 'image-' + Date.now(),
        url: data.url,
        sourceWidth: result.sourceWidth,
        sourceHeight: result.sourceHeight,
        displayWidth: result.displayWidth,
        displayHeight: result.displayHeight,
        crop: {
          x: 0,
          y: 0,
          width: result.sourceWidth,
          height: result.sourceHeight
        },
        alignment: 'center',
        cadre: DEFAULT_IMAGE_CADRE  // ✅ Utiliser les valeurs par défaut
      }

      onUpdate({ maNouvelleImage: newImage })
    } catch (error) {
      console.error('Erreur upload:', error)
    } finally {
      setUploading(false)
    }
  }

  // ✅ Gestion de la mise à jour de l'image
  const handleImageUpdate = (updatedImage: MaNouvelleImageItem) => {
    // ✅ IMPORTANT : Préserver alignment et cadre si non fournis
    const currentImage = designConfig.maNouvelleImage
    onUpdate({
      maNouvelleImage: {
        ...updatedImage,
        alignment: updatedImage.alignment ?? currentImage?.alignment ?? 'center',
        cadre: updatedImage.cadre ?? currentImage?.cadre
      }
    })
  }

  // ✅ Gestion du cadre
  const handleCadreToggle = () => {
    if (!currentImage) return
    const prev = currentImage.cadre || DEFAULT_IMAGE_CADRE
    const updated = { ...prev, enabled: !prev.enabled }
    onUpdate({
      maNouvelleImage: {
        ...currentImage,
        cadre: updated
      }
    })
  }

  const handleCadreChange = (cadreUpdates: Partial<CadreConfig>) => {
    if (!currentImage) return

    // ✅ Stocker les couleurs modifiées pour la palette
    if (cadreUpdates.backgroundColor && cadreUpdates.backgroundColor !== currentImage.cadre?.backgroundColor) {
      setTempBackgroundColor(cadreUpdates.backgroundColor)
    }
    if (cadreUpdates.border?.color && cadreUpdates.border.color !== currentImage.cadre?.border?.color) {
      setTempBorderColor(cadreUpdates.border.color)
    }

    const currentCadre = currentImage.cadre || DEFAULT_IMAGE_CADRE
    const isSynced = currentCadre.syncWithGlobal !== false

    const merged = {
      ...DEFAULT_IMAGE_CADRE,
      ...currentCadre,
      ...cadreUpdates,
      border: {
        ...currentCadre.border,
        ...(cadreUpdates?.border || {})
      }
    }

    // ✅ Si synchronisé, appliquer à toutes les images synchronisées
    if (isSynced) {
      // Appliquer aux logos synchronisés
      const updatedLogos = designConfig.logoHeader.map(logo => {
        if (logo.cadre?.syncWithGlobal !== false) {
          return {
            ...logo,
            cadre: {
              ...logo.cadre,
              backgroundColor: merged.backgroundColor,
              borderRadius: merged.borderRadius,
              borderRadiusEnabled: merged.borderRadiusEnabled,
              border: {
                ...logo.cadre?.border,
                enabled: merged.border?.enabled || false,
                color: merged.border?.color || '#000000',
                width: merged.border?.width || 2
              }
            }
          }
        }
        return logo
      })

      // Appliquer à la photo synchronisée
      const updatedPhoto = designConfig.photo?.cadre?.syncWithGlobal !== false ? {
        ...designConfig.photo,
        cadre: {
          ...designConfig.photo.cadre,
          backgroundColor: merged.backgroundColor,
          borderRadius: merged.borderRadius,
          borderRadiusEnabled: merged.borderRadiusEnabled,
          border: {
            ...designConfig.photo.cadre?.border,
            enabled: merged.border?.enabled || false,
            color: merged.border?.color || '#000000',
            width: merged.border?.width || 2
          }
        }
      } : designConfig.photo

      // Mettre à jour toutes les images synchronisées
      onUpdate({
        logoHeader: updatedLogos,
        photo: updatedPhoto,
        maNouvelleImage: {
          ...currentImage,
          cadre: merged
        }
      })
    } else {
      // ✅ Si indépendant, mettre à jour seulement cette image
      onUpdate({
        maNouvelleImage: {
          ...currentImage,
          cadre: merged
        }
      })
    }
  }

  // ✅ Toggle synchronisation
  const handleToggleSyncWithGlobal = () => {
    if (!currentImage) return

    const currentCadre = currentImage.cadre || DEFAULT_IMAGE_CADRE
    const newSyncState = currentCadre.syncWithGlobal === false ? true : false

    const updatedImage: MaNouvelleImageItem = {
      ...currentImage,
      cadre: {
        ...currentCadre,
        syncWithGlobal: newSyncState
      }
    }

    // Si on synchronise, appliquer les réglages globaux
    if (newSyncState) {
      const globalCadre = designConfig.logoHeader.find(l => l.cadre?.syncWithGlobal !== false)?.cadre ||
                          designConfig.photo?.cadre ||
                          DEFAULT_IMAGE_CADRE

      updatedImage.cadre = {
        ...updatedImage.cadre,
        syncWithGlobal: true,
        backgroundColor: globalCadre.backgroundColor,
        borderRadius: globalCadre.borderRadius,
        borderRadiusEnabled: globalCadre.borderRadiusEnabled,
        border: {
          ...updatedImage.cadre?.border,
          enabled: globalCadre.border?.enabled || false,
          color: globalCadre.border?.color || '#000000',
          width: globalCadre.border?.width || 2
        }
      }
    }

    onUpdate({ maNouvelleImage: updatedImage })
  }

  // ✅ Appliquer à toutes les images
  const handleApplyToAllImages = useCallback(() => {
    if (!currentImage?.cadre) return

    const currentCadre = currentImage.cadre

    // Appliquer aux logos
    const updatedLogos = designConfig.logoHeader.map(logo => ({
      ...logo,
      cadre: {
        ...logo.cadre,
        backgroundColor: currentCadre.backgroundColor,
        borderRadius: currentCadre.borderRadius,
        borderRadiusEnabled: currentCadre.borderRadiusEnabled,
        border: {
          ...logo.cadre?.border,
          enabled: currentCadre.border?.enabled || false,
          color: currentCadre.border?.color || '#000000',
          width: currentCadre.border?.width || 2
        },
        syncWithGlobal: true
      }
    }))

    // Appliquer à la photo
    const updatedPhoto = designConfig.photo ? {
      ...designConfig.photo,
      cadre: {
        ...designConfig.photo.cadre,
        backgroundColor: currentCadre.backgroundColor,
        borderRadius: currentCadre.borderRadius,
        borderRadiusEnabled: currentCadre.borderRadiusEnabled,
        border: {
          ...designConfig.photo.cadre?.border,
          enabled: currentCadre.border?.enabled || false,
          color: currentCadre.border?.color || '#000000',
          width: currentCadre.border?.width || 2
        },
        syncWithGlobal: true
      }
    } : designConfig.photo

    // Appliquer à cette image aussi
    const updatedImage: MaNouvelleImageItem = {
      ...currentImage,
      cadre: {
        ...currentImage.cadre,
        syncWithGlobal: true
      }
    }

    onUpdate({
      logoHeader: updatedLogos,
      photo: updatedPhoto,
      maNouvelleImage: updatedImage
    })
  }, [currentImage, designConfig.logoHeader, designConfig.photo, onUpdate])

  // ✅ Gestion de l'alignement
  const handleAlignChange = (alignment: 'left' | 'center' | 'right') => {
    if (!currentImage) return
    onUpdate({
      maNouvelleImage: {
        ...currentImage,
        alignment
      }
    })
  }

  // ✅ Ajouter les couleurs à la palette à la fermeture
  useEffect(() => {
    if (!sidePanelOpen && isActive) {
      let newColors = [...designConfig.projectColors]
      
      if (tempBackgroundColor) {
        newColors = addColorToPalette(newColors, tempBackgroundColor)
        setTempBackgroundColor(null)
      }
      if (tempBorderColor) {
        newColors = addColorToPalette(newColors, tempBorderColor)
        setTempBorderColor(null)
      }
      
      if (newColors.length !== designConfig.projectColors.length) {
        onUpdate({ projectColors: newColors })
      }
    }
  }, [sidePanelOpen, isActive, designConfig.projectColors, tempBackgroundColor, tempBorderColor, onUpdate])

  // ✅ Gestion du clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isActive) return

      const target = event.target as Node
      const clickedInContainer = containerRef.current?.contains(target)
      const clickedInToolbar = toolbarRef.current?.contains(target)
      const clickedInSidePanel = sidePanelRef.current?.contains(target)

      if (clickedInContainer || clickedInToolbar || clickedInSidePanel) {
        return
      }

      if (sidePanelOpen) {
        setSidePanelOpen(false)
      } else {
        deactivateRubrique()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActive, sidePanelOpen])

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[80px]"
      onClick={handleContainerClick}
    >
      {!currentImage ? (
        <div className="w-full h-20" />
      ) : (
        <div style={{ width: maxWidth, textAlign: currentImage.alignment || 'center' }}>
          <ImageEditor
            image={currentImage}
            onUpdate={handleImageUpdate}
            maxWidth={maxWidth}
            isActive={isActive}
            onActivate={handleContainerClick}
            onDeactivate={() => {}}
            className="inline-block"
          />
        </div>
      )}

      {isActive && toolbarPosition && (
        <div ref={toolbarRef}>
          <FloatingToolbar
            position={toolbarPosition}
            mode="image"
            onUploadClick={() => {
              setSidePanelType('upload')
              setSidePanelOpen(true)
            }}
            onImageAlignClick={() => {
              setSidePanelType('logo-alignment' as any)
              setSidePanelOpen(true)
            }}
            onImageCadreClick={() => {
              setSidePanelType('cadre')
              setSidePanelOpen(true)
            }}
            imageCadreEnabled={false}
            onClose={() => {
              deactivateRubrique()
              setSidePanelOpen(false)
            }}
          />
        </div>
      )}

      {isActive && sidePanelOpen && toolbarPosition && (
        <div ref={sidePanelRef}>
          <SidePanel
            type={sidePanelType}
            position={toolbarPosition}
            currentImageUrl={currentImage?.url}
            onImageUpload={handleImageUpload}
            onImageRemove={() => setDeleteModalOpen(true)}
            acceptedFormats={['.jpg', '.jpeg', '.png', '.svg', '.webp']}
            maxSize={5 * 1024 * 1024}
            logoAlignment={currentImage?.alignment}
            onLogoAlignChange={handleAlignChange}
            projectColors={designConfig.projectColors}
            cadre={sidePanelType === 'cadre' ? (currentImage?.cadre || DEFAULT_IMAGE_CADRE) : undefined}
            onCadreToggle={handleCadreToggle}
            onCadreChange={handleCadreChange}
            onApplyToAllImages={handleApplyToAllImages}
            onToggleSyncWithGlobal={handleToggleSyncWithGlobal}
            onClose={() => setSidePanelOpen(false)}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          onUpdate({ maNouvelleImage: undefined })
          setSidePanelOpen(false)
          setDeleteModalOpen(false)
        }}
        title="Supprimer l'image"
        message="Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />
    </div>
  )
}
```

### Étape 3 : Intégrer dans le builder principal

```typescript
// components/builder-v6/DesignBuilder.tsx (exemple)

import MaNouvelleImageInlineEditor from './MaNouvelleImageInlineEditor'

// Dans le rendu :
<MaNouvelleImageInlineEditor
  designConfig={designConfig}
  onUpdate={handleUpdate}
  concertationId={concertationId}
/>
```

---

## 🔄 Gestion de la synchronisation

### Principe

La synchronisation permet à une image de suivre automatiquement les modifications des réglages de cadre (bordure, arrondi, couleur) des autres images synchronisées.

### Propriété `syncWithGlobal`

```typescript
cadre: {
  syncWithGlobal: true   // ✅ Synchronisé (par défaut)
  // OU
  syncWithGlobal: false  // ❌ Indépendant
}
```

### Comportement

#### Image synchronisée (`syncWithGlobal: true`)
- ✅ Les modifications de cette image sont propagées à toutes les images synchronisées
- ✅ Les modifications d'autres images synchronisées sont appliquées à cette image
- ✅ Le bouton "Synchroniser avec les autres images" est coché dans le SidePanel

#### Image indépendante (`syncWithGlobal: false`)
- ✅ Les modifications n'affectent que cette image
- ✅ Les modifications d'autres images ne l'affectent pas
- ✅ Le bouton "Synchroniser avec les autres images" est décoché dans le SidePanel

### Implémentation dans `handleCadreChange`

```typescript
const handleCadreChange = (cadreUpdates: Partial<CadreConfig>) => {
  const currentCadre = currentImage.cadre || DEFAULT_IMAGE_CADRE
  const isSynced = currentCadre.syncWithGlobal !== false

  const merged = {
    ...DEFAULT_IMAGE_CADRE,
    ...currentCadre,
    ...cadreUpdates,
    border: {
      ...currentCadre.border,
      ...(cadreUpdates?.border || {})
    }
  }

  if (isSynced) {
    // ✅ PROPAGER aux autres images synchronisées
    const updatedLogos = designConfig.logoHeader.map(logo => {
      if (logo.cadre?.syncWithGlobal !== false) {
        return {
          ...logo,
          cadre: {
            ...logo.cadre,
            backgroundColor: merged.backgroundColor,
            borderRadius: merged.borderRadius,
            borderRadiusEnabled: merged.borderRadiusEnabled,
            border: { /* ... */ }
          }
        }
      }
      return logo
    })

    const updatedPhoto = designConfig.photo?.cadre?.syncWithGlobal !== false ? {
      ...designConfig.photo,
      cadre: { /* ... */ }
    } : designConfig.photo

    onUpdate({
      logoHeader: updatedLogos,
      photo: updatedPhoto,
      maNouvelleImage: { ...currentImage, cadre: merged }
    })
  } else {
    // ✅ MISE À JOUR LOCALE uniquement
    onUpdate({
      maNouvelleImage: {
        ...currentImage,
        cadre: merged
      }
    })
  }
}
```

### Toggle de synchronisation

```typescript
const handleToggleSyncWithGlobal = () => {
  const currentCadre = currentImage.cadre || DEFAULT_IMAGE_CADRE
  const newSyncState = currentCadre.syncWithGlobal === false ? true : false

  const updatedImage = {
    ...currentImage,
    cadre: {
      ...currentCadre,
      syncWithGlobal: newSyncState
    }
  }

  // Si on synchronise, appliquer les réglages globaux
  if (newSyncState) {
    const globalCadre = designConfig.logoHeader.find(l => l.cadre?.syncWithGlobal !== false)?.cadre ||
                        designConfig.photo?.cadre ||
                        DEFAULT_IMAGE_CADRE

    updatedImage.cadre = {
      ...updatedImage.cadre,
      syncWithGlobal: true,
      backgroundColor: globalCadre.backgroundColor,
      borderRadius: globalCadre.borderRadius,
      borderRadiusEnabled: globalCadre.borderRadiusEnabled,
      border: { /* ... */ }
    }
  }

  onUpdate({ maNouvelleImage: updatedImage })
}
```

---

## 📚 Exemples complets

### Exemple 1 : Image unique (comme Photo)

Voir `components/builder-v6/PhotoInlineEditor.tsx` pour un exemple complet d'image unique.

### Exemple 2 : Images multiples (comme Logo)

Voir `components/builder-v6/LogoHeaderInlineEditor.tsx` pour un exemple complet d'images multiples avec drag & drop.

---

## ✅ Bonnes pratiques

### 1. Toujours préserver `alignment` et `cadre` lors des mises à jour

```typescript
const handleImageUpdate = (updatedImage: ImageItem) => {
  const currentImage = designConfig.monImage
  onUpdate({
    monImage: {
      ...updatedImage,
      alignment: updatedImage.alignment ?? currentImage?.alignment ?? 'center',
      cadre: updatedImage.cadre ?? currentImage?.cadre
    }
  })
}
```

### 2. Utiliser les valeurs par défaut

```typescript
const DEFAULT_IMAGE_CADRE: CadreConfig = {
  enabled: false,
  backgroundColor: 'transparent',
  borderRadius: 8,
  borderRadiusEnabled: false,
  syncWithGlobal: true,  // ✅ Toujours synchronisé par défaut
  padding: 16,
  border: {
    enabled: false,
    color: '#000000',
    width: 2
  }
}
```

### 3. Appliquer l'alignement visuellement

```tsx
<div style={{ width: maxWidth, textAlign: currentImage.alignment || 'center' }}>
  <ImageEditor
    image={currentImage}
    onUpdate={handleImageUpdate}
    maxWidth={maxWidth}
    isActive={isActive}
    onActivate={handleActivate}
    onDeactivate={() => {}}
    className="inline-block"  // ✅ Important pour que text-align fonctionne
  />
</div>
```

### 4. Gérer les couleurs dans la palette

```typescript
// Stocker temporairement les couleurs modifiées
const [tempBackgroundColor, setTempBackgroundColor] = useState<string | null>(null)
const [tempBorderColor, setTempBorderColor] = useState<string | null>(null)

// Dans handleCadreChange
if (cadreUpdates.backgroundColor && cadreUpdates.backgroundColor !== currentImage.cadre?.backgroundColor) {
  setTempBackgroundColor(cadreUpdates.backgroundColor)
}

// Ajouter à la palette à la fermeture
useEffect(() => {
  if (!sidePanelOpen && isActive) {
    let newColors = [...designConfig.projectColors]
    if (tempBackgroundColor) {
      newColors = addColorToPalette(newColors, tempBackgroundColor)
      setTempBackgroundColor(null)
    }
    if (tempBorderColor) {
      newColors = addColorToPalette(newColors, tempBorderColor)
      setTempBorderColor(null)
    }
    if (newColors.length !== designConfig.projectColors.length) {
      onUpdate({ projectColors: newColors })
    }
  }
}, [sidePanelOpen, isActive, designConfig.projectColors, tempBackgroundColor, tempBorderColor, onUpdate])
```

### 5. Gérer le clic extérieur

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (!isActive) return

    const target = event.target as Node
    const clickedInContainer = containerRef.current?.contains(target)
    const clickedInToolbar = toolbarRef.current?.contains(target)
    const clickedInSidePanel = sidePanelRef.current?.contains(target)

    if (clickedInContainer || clickedInToolbar || clickedInSidePanel) {
      return
    }

    if (sidePanelOpen) {
      setSidePanelOpen(false)
    } else {
      deactivateRubrique()
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [isActive, sidePanelOpen])
```

---

## 🔍 Checklist d'intégration

- [ ] Définir l'interface qui étend `ImageItemBase` dans `types/design-v6.ts`
- [ ] Ajouter la propriété au `DesignConfigV6`
- [ ] Créer le composant `*InlineEditor.tsx`
- [ ] Importer `ImageEditor` depuis `@/components/shared/ImageEditor`
- [ ] Définir `DEFAULT_IMAGE_CADRE` avec `syncWithGlobal: true`
- [ ] Implémenter `handleImageUpdate` en préservant `alignment` et `cadre`
- [ ] Implémenter `handleCadreChange` avec gestion de la synchronisation
- [ ] Implémenter `handleToggleSyncWithGlobal`
- [ ] Implémenter `handleApplyToAllImages`
- [ ] Ajouter la gestion des couleurs (`tempBackgroundColor`, `tempBorderColor`)
- [ ] Ajouter le `useEffect` pour ajouter les couleurs à la palette
- [ ] Appliquer l'alignement visuellement avec `textAlign`
- [ ] Gérer le clic extérieur
- [ ] Intégrer dans le builder principal
- [ ] Tester la synchronisation avec les autres images

---

## 📞 Support

Pour toute question ou problème :
1. Consulter les exemples existants (`LogoHeaderInlineEditor.tsx`, `PhotoInlineEditor.tsx`)
2. Vérifier les types dans `types/design-v6.ts`
3. Consulter la documentation des composants dans `components/shared/ImageEditor/`

---

**Dernière mise à jour :** 2025-01-04

