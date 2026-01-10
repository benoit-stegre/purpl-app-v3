# 📸 ÉTAT DU PROJET PURPL V3 - 10 Janvier 2026

## 📊 Résumé Exécutif

### Métriques Générales
- **66 fichiers** dans `/components/builder-v6/` (37 fichiers `.tsx` actifs)
- **6 routes** principales dans `/app/dashboard/concertations/creer/`
- **7 builders** dans `/components/builder-v6/builders/`
- **10 rubriques** définies dans le type `RubriqueType`
- **~70% du builder complété** (estimation basée sur les composants actifs)

### Points d'Attention Critiques
- ⚠️ **Plusieurs builders sont des stubs** (LogoHeaderBuilder, PhotoBuilder, LogosPartenairesBuilder, ButtonsBuilder, TextBuilder)
- ⚠️ **Nombreux fichiers de backup** (28+ fichiers `.backup` dans builder-v6)
- ⚠️ **Deux systèmes de design coexistants** (`design.ts` et `design-v6.ts`)
- ⚠️ **Route `/app/dashboard/concertations/creer/design/page.tsx` utilise encore l'ancien système**
- ⚠️ **Pas de fichier `.env.local` visible** (configuration environnement non documentée)

---

## 🗂️ Arborescence Complète

### 📁 `/app` - Routes Next.js

#### Pages Publiques
- `/app/page.tsx` - Page d'accueil (simple landing page)
- `/app/login/page.tsx` - Page de connexion
- `/app/test-crop/page.tsx` - Page de test pour le crop d'images
- `/app/test-icons/page.tsx` - Page de test pour les icônes

#### Routes API (`/app/api/`)
- `/api/admin/reset-buttons/route.ts` - Reset des boutons (admin)
- `/api/concertations/route.ts` - CRUD concertations
- `/api/concertations/[id]/route.ts` - Opérations sur une concertation
- `/api/questions/route.ts` - CRUD questions
- `/api/questions/[id]/route.ts` - Opérations sur une question
- `/api/remerciements/route.ts` - CRUD remerciements
- `/api/remerciements/[id]/route.ts` - Opérations sur un remerciement
- `/api/upload/route.ts` - Upload de fichiers

#### Routes Public (`/app/c/[slug]/`)
- `/c/[slug]/layout.tsx` - Layout pour les concertations publiques
- `/c/[slug]/page.tsx` - Page publique de concertation
- `/c/[slug]/q/[questionIndex]/page.tsx` - Page de question publique
- `/c/[slug]/merci/page.tsx` - Page de remerciement

#### Routes Dashboard (`/app/dashboard/`)
- `/dashboard/page.tsx` - Dashboard principal
- `/dashboard/concertations/page.tsx` - Liste des concertations
- `/dashboard/concertations/resultats/page.tsx` - Liste des résultats
- `/dashboard/concertations/resultats/[id]/page.tsx` - Résultats d'une concertation

#### Tunnel de Création (`/app/dashboard/concertations/creer/`)
- `/creer/accueil/page.tsx` - **✅ ACTIF - Utilise builder-v6** (grand fichier, ~243 lignes)
- `/creer/design/page.tsx` - **⚠️ ANCIEN SYSTÈME** (utilise design.ts, pas design-v6.ts)
- `/creer/questionnaire/page.tsx` - Édition du questionnaire
- `/creer/remerciement/page.tsx` - Édition du remerciement
- `/creer/affiche/page.tsx` - Aperçu et export de l'affiche
- `/creer/export/page.tsx` - Export final

### 📁 `/components` - Composants React

#### `/components/builder-v6/` - **SYSTÈME V6 (ACTIF)**
**66 fichiers au total** avec de nombreux backups :

##### Composants Principaux
- `PhonePreview.tsx` - **✅ COMPLET** - Prévisualisation mobile (153 lignes)
- `BuilderOverlay.tsx` - **✅ COMPLET** - Overlay pour les builders (41 lignes)
- `BuilderSidebar.tsx` - **✅ COMPLET** - Sidebar pour builders grands (35 lignes)
- `BuilderSmall.tsx` - **✅ COMPLET** - Petits builders flottants (65 lignes)

##### Builders (`/components/builder-v6/builders/`)
- `TitreBuilder.tsx` - **✅ COMPLET** - Builder pour le titre (208 lignes)
- `FondBuilder.tsx` - **✅ COMPLET** - Builder pour le fond (82 lignes)
- `ButtonsBuilder.tsx` - **❌ STUB** - "Builder en cours de développement..." (22 lignes)
- `TextBuilder.tsx` - **❌ STUB** - "Builder en cours de développement..." (28 lignes)
- `LogoHeaderBuilder.tsx` - **❌ STUB** - "Builder en cours de développement..." (22 lignes)
- `PhotoBuilder.tsx` - **❌ STUB** - "Builder en cours de développement..." (22 lignes)
- `LogosPartenairesBuilder.tsx` - **❌ STUB** - "Builder en cours de développement..." (22 lignes)

##### Éditeurs Inline
- `TitreInlineEditor.tsx` - **✅ COMPLET** - Édition inline du titre
- `ExplanationCourteInlineEditor.tsx` - **✅ COMPLET** - Édition texte riche court
- `ExplanationLongueInlineEditor.tsx` - **✅ COMPLET** - Édition texte riche long avec blocs (483 lignes)
- `TexteObligatoireInlineEditor.tsx` - **✅ COMPLET** - Édition texte obligatoire
- `ButtonInlineEditor.tsx` - **✅ COMPLET** - Édition du bouton
- `ResumeConcertationInlineEditor.tsx` - **✅ COMPLET** - Résumé concertation
- `LogoHeaderInlineEditor.tsx` - **✅ COMPLET** - Gestion logos header (nombreux backups)
- `LogosPartenairesInlineEditor.tsx` - **✅ COMPLET** - Gestion logos partenaires
- `PhotoInlineEditor.tsx` - **✅ COMPLET** - Gestion photo (nombreux backups)

##### Composants de Support
- `LogoItem.tsx` - **✅ COMPLET** - Affichage d'un logo (259 lignes)
- `LogoItemWithCrop.tsx` - **✅ COMPLET** - Logo avec fonctionnalité crop
- `PhotoItem.tsx` - **✅ COMPLET** - Affichage d'une photo (264 lignes)
- `PhotoItemWithCrop.tsx` - **✅ COMPLET** - Photo avec fonctionnalité crop
- `PhotoItemEditor.tsx` - **✅ COMPLET** - Éditeur de photo
- `ImageCropCanvas.tsx` - **✅ COMPLET** - Canvas pour crop d'images (480 lignes)
- `LogoCropModal.tsx` - **✅ COMPLET** - Modal de crop pour logos
- `RichTextEditor.tsx` - **✅ COMPLET** - Éditeur de texte riche (TipTap) (159 lignes)
- `EditableText.tsx` - **✅ COMPLET** - Composant texte éditable
- `FloatingToolbar.tsx` - **✅ COMPLET** - Barre d'outils flottante
- `InlineEditorWrapper.tsx` - **✅ COMPLET** - Wrapper pour éditeurs inline
- `SidePanel.tsx` - **✅ COMPLET** - Panneau latéral (plusieurs backups)
- `HeaderEditor.tsx` - **✅ COMPLET** - Éditeur d'en-tête
- `AvatarOverlay.tsx` - **✅ COMPLET** - Overlay avatar
- `BuilderSidebar.tsx` - **✅ COMPLET** - Sidebar du builder

##### Fichiers de Backup
- **28+ fichiers `.backup`** ou avec timestamps dans le nom
- Principalement : LogoItem, PhotoItem, LogoHeaderInlineEditor, PhotoInlineEditor, FloatingToolbar, SidePanel

#### `/components/builder/` - **ANCIEN SYSTÈME (DÉPRÉCIÉ ?)**
- `PhonePreview.tsx` - Ancienne version
- `/blocks/` - 7 fichiers `.tsx` + 1 backup
- `/shared/` - 4 fichiers `.tsx` + plusieurs backups

#### `/components/affiche/` - Export PDF
- `/pdf/` - 4 composants de templates PDF
  - `AffichePDFDocument.tsx`
  - `TemplateClassic.tsx`
  - `TemplateMinimal.tsx`
  - `TemplateModern.tsx`
- `/preview/` - 4 composants de prévisualisation
  - `AffichePreview.tsx`
  - `TemplateClassic.tsx`
  - `TemplateMinimal.tsx`
  - `TemplateModern.tsx`

#### `/components/formulaire/` - Formulaire Public
- `FormulairePublic.tsx` - Formulaire de participation
- `QuestionRenderer.tsx` - Rendu des questions

#### `/components/questionnaire/` - Gestion Questionnaire
- `QuestionCard.tsx` - Carte de question
- `QuestionEditor.tsx` - Éditeur de question
- `QuestionModal.tsx` - Modal d'édition
- `QuestionPreview.tsx` - Aperçu de question
- `QuestionsList.tsx` - Liste des questions

#### `/components/remerciement/` - Remerciement
- `RemerciementEditor.tsx` - Éditeur de remerciement

#### `/components/shared/` - Composants Partagés
- `ConfirmModal.tsx` - Modal de confirmation
- `/ImageEditor/` - 7 fichiers (4 `.tsx` + 3 `.ts`)
  - `ImageCropModal.tsx`
  - `ImageDisplay.tsx`
  - `ImageEditor.tsx`
  - `ImageResizeHandle.tsx`
  - `index.ts`, `types.ts`, `utils.ts`

#### `/components/tunnel/` - Navigation Tunnel
- `TunnelHeader.tsx` - En-tête du tunnel
- `TunnelLayout.tsx` - Layout du tunnel

### 📁 `/types` - Types TypeScript

#### `design-v6.ts` - **✅ ACTIF (Version 7.4)**
**336 lignes** - Système de design principal utilisé par builder-v6

**Interfaces Principales :**
- `ImageItemBase` - Base pour images avec crop et resize
- `LogoItem extends ImageItemBase` - Logo avec order et alignment
- `PhotoItem extends ImageItemBase` - Photo avec alignment
- `CadreConfig` - Configuration des cadres (fond, bordure, padding, borderRadius)
- `TextConfig` - Configuration texte simple (text, font, fontSize, color, textAlign, bold, italic, underline)
- `RichTextConfig` - Configuration texte riche (content HTML)
- `ExplanationLongueBlock` - Bloc de texte long avec id et order
- `ButtonsConfig` - **ANCIEN** - Configuration des boutons (deprecated ?)
- `ButtonConfig` - **NOUVEAU** - Configuration d'un bouton unique (shadow, border, etc.)
- `FondConfig` - Fond (type: color | image, value)
- `DesignConfigV6` - **Interface principale** regroupant toutes les rubriques

**Rubriques définies :**
```typescript
type RubriqueType = 
  | 'logoHeader'
  | 'titre'
  | 'photo'
  | 'explanationCourte'
  | 'explanationLongue'
  | 'buttons'  // ⚠️ ANCIEN ?
  | 'bouton'   // ✅ NOUVEAU
  | 'texteObligatoire'
  | 'logosPartenaires'
  | 'fond'
```

**3 fichiers backup** : design-v6.ts.backup_*

#### `design.ts` - **⚠️ ANCIEN SYSTÈME (173 lignes)**
Ancienne interface de design utilisée par `/app/dashboard/concertations/creer/design/page.tsx`

**Différences principales :**
- `CropConfig` avec `x, y, scale` au lieu de `x, y, width, height`
- `LogoPartenaireConfig` avec `size: 'small' | 'medium' | 'large'`
- Structure plus simple mais moins flexible

### 📁 `/hooks` - Hooks React

- `useBuilder.ts` - **✅ COMPLET** - Gestion des builders (Zustand store, 60 lignes)
- `useDesignHistory.ts` - **✅ COMPLET** - Historique undo/redo (Zustand, 5 lignes)
- `useInlineEditor.ts` - **✅ COMPLET** - Gestion éditeurs inline (1 backup)

### 📁 `/stores` - Stores Zustand

- `historyStore.ts` - **✅ COMPLET** - Store d'historique générique (80 lignes)
- `questionnaireStore.ts` - Store pour questionnaire

### 📁 `/lib` - Utilitaires

#### `/lib/utils/`
- `image.ts` - Utilitaires images (1 backup)
- `image-logo.ts` - **✅ COMPLET** - Helpers pour logos (114 lignes)
- `toolbarPosition.ts` - Position de la toolbar

#### `/lib/constants/`
- `fonts.ts` - Liste des polices disponibles
- `upload.ts` - Configuration upload

#### `/lib/supabase/`
- `client.ts` - Client Supabase côté client
- `server.ts` - Client Supabase côté serveur

#### `/lib/`
- `addColorToPalette.ts` - Ajout de couleur à la palette
- `extractProjectColors.ts` - Extraction couleurs du projet
- `isRichTextEmpty.ts` - Vérification texte vide

---

## 🧩 Composants Builder V6 - État Détaillé

| Composant | État | Taille | Description | Dépendances | Notes |
|-----------|------|--------|-------------|-------------|-------|
| **PhonePreview** | ✅ Complet | Grand | Prévisualisation mobile avec tous les éditeurs inline | Tous les InlineEditor, useInlineEditor | 153 lignes, composant central |
| **BuilderOverlay** | ✅ Complet | Petit | Overlay avec backdrop, gère BuilderSmall/Sidebar | BuilderSmall, BuilderSidebar, useBuilder | 41 lignes |
| **BuilderSidebar** | ✅ Complet | Petit | Sidebar fixe pour builders grands | LogoHeaderBuilder, PhotoBuilder, LogosPartenairesBuilder, FondBuilder | 35 lignes |
| **BuilderSmall** | ✅ Complet | Moyen | Petits builders flottants positionnés | TitreBuilder, TextBuilder, ButtonsBuilder, FondBuilder | 65 lignes |
| **TitreBuilder** | ✅ Complet | Grand | Builder complet pour titre (police, taille, couleur, cadre) | useBuilder, useDesignHistory | 208 lignes |
| **FondBuilder** | ✅ Complet | Moyen | Builder pour couleur de fond | useBuilder, useDesignHistory | 82 lignes |
| **ButtonsBuilder** | ❌ Stub | Petit | "Builder en cours de développement..." | useBuilder | 22 lignes, placeholder |
| **TextBuilder** | ❌ Stub | Petit | "Builder en cours de développement..." | useBuilder | 28 lignes, placeholder |
| **LogoHeaderBuilder** | ❌ Stub | Petit | "Builder en cours de développement..." | useBuilder | 22 lignes, placeholder |
| **PhotoBuilder** | ❌ Stub | Petit | "Builder en cours de développement..." | useBuilder | 22 lignes, placeholder |
| **LogosPartenairesBuilder** | ❌ Stub | Petit | "Builder en cours de développement..." | useBuilder | 22 lignes, placeholder |
| **TitreInlineEditor** | ✅ Complet | Moyen | Édition inline du titre avec RichTextEditor | RichTextEditor, designConfig | Utilisé dans PhonePreview |
| **ExplanationCourteInlineEditor** | ✅ Complet | Moyen | Édition texte riche court | RichTextEditor, FloatingToolbar | Texte formaté |
| **ExplanationLongueInlineEditor** | ✅ Complet | Très Grand | Édition blocs texte long avec drag & drop | @dnd-kit/sortable, RichTextEditor, FloatingToolbar | 483 lignes, gestion multiple blocs |
| **TexteObligatoireInlineEditor** | ✅ Complet | Moyen | Édition texte obligatoire | RichTextEditor, FloatingToolbar | |
| **ButtonInlineEditor** | ✅ Complet | Moyen | Édition propriétés bouton | designConfig | |
| **LogoHeaderInlineEditor** | ✅ Complet | Grand | Gestion upload, crop, resize logos | LogoItem, LogoItemWithCrop, LogoCropModal, ImageCropCanvas | Nombreux backups |
| **LogosPartenairesInlineEditor** | ✅ Complet | Grand | Gestion logos partenaires | LogoItem, LogoItemWithCrop, LogoCropModal | Similaire à LogoHeader |
| **PhotoInlineEditor** | ✅ Complet | Grand | Gestion upload, crop, resize photo | PhotoItem, PhotoItemWithCrop, ImageCropCanvas | Nombreux backups |
| **LogoItem** | ✅ Complet | Grand | Affichage logo avec resize drag handles | lucide-react (RotateCcw, Trash2) | 259 lignes, gestion crop |
| **LogoItemWithCrop** | ✅ Complet | Grand | Logo avec fonctionnalité crop active | LogoItem, ImageCropCanvas | |
| **PhotoItem** | ✅ Complet | Grand | Affichage photo avec resize drag handles | lucide-react | 264 lignes, similaire à LogoItem |
| **PhotoItemWithCrop** | ✅ Complet | Grand | Photo avec fonctionnalité crop active | PhotoItem, ImageCropCanvas | |
| **ImageCropCanvas** | ✅ Complet | Très Grand | Canvas interactif pour crop avec poignées | useRef, useState, useEffect | 480 lignes, logique complexe |
| **LogoCropModal** | ✅ Complet | Moyen | Modal pour crop de logos | ImageCropCanvas | |
| **RichTextEditor** | ✅ Complet | Moyen | Éditeur TipTap avec toolbar | @tiptap/react, StarterKit, Underline, TextAlign | 159 lignes, expose handle |
| **FloatingToolbar** | ✅ Complet | Moyen | Barre d'outils flottante (gras, italique, souligné) | RichTextEditor | 3 backups |
| **InlineEditorWrapper** | ✅ Complet | Petit | Wrapper avec titre et état vide/actif | useInlineEditor | |
| **SidePanel** | ✅ Complet | Moyen | Panneau latéral configurable | designConfig | 4 backups |
| **HeaderEditor** | ✅ Complet | Moyen | En-tête avec nom concertation et actions | useBuilder, useDesignHistory | |
| **AvatarOverlay** | ✅ Complet | Petit | Overlay pour avatar utilisateur | | |

**Résumé :**
- ✅ **Complets** : 24 composants
- ❌ **Stubs** : 5 builders (ButtonsBuilder, TextBuilder, LogoHeaderBuilder, PhotoBuilder, LogosPartenairesBuilder)
- 📦 **Total fichiers actifs** : 37 fichiers `.tsx` (hors backups)

---

## 📝 Types et Interfaces

### `DesignConfigV6` - Structure Principale

```typescript
interface DesignConfigV6 {
  projectColors: string[]
  
  logoHeader: LogoItem[]  // Array de logos
  
  titre: TextConfig  // Texte simple
  
  photo: PhotoItem | null  // Photo unique (nullable)
  
  explanationCourte: RichTextConfig  // HTML riche
  
  explanationLongue: ExplanationLongueBlock[]  // Array de blocs HTML
  
  buttons: ButtonsConfig  // ⚠️ ANCIEN (button1Text, button2Text)
  
  bouton: ButtonConfig  // ✅ NOUVEAU (texte unique avec style avancé)
  
  texteObligatoire: RichTextConfig  // HTML riche
  
  logosPartenaires: LogoItem[]  // Array de logos
  
  fond: FondConfig  // { type: 'color' | 'image', value: string }
}
```

### `ImageItemBase` - Base pour Images

```typescript
interface ImageItemBase {
  id: string
  url: string
  
  // Dimensions source (immuables)
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

### `LogoItem` extends `ImageItemBase`

```typescript
interface LogoItem extends ImageItemBase {
  order: number
  alignment?: 'left' | 'center' | 'right'
  cadre?: CadreConfig
}
```

### `PhotoItem` extends `ImageItemBase`

```typescript
interface PhotoItem extends ImageItemBase {
  alignment?: 'left' | 'center' | 'right'
  cadre?: CadreConfig
}
```

### `ButtonConfig` - Configuration Bouton (NOUVEAU)

```typescript
interface ButtonConfig {
  text: string
  backgroundColor: string
  hasBackground: boolean
  border: {
    width: number
    color: string
    hasBorder: boolean
    radius: number
  }
  textColor: string
  fontFamily: string
  fontSize: number
  bold: boolean
  shadow: {
    enabled: boolean
    blur: number
    offsetY: number
    color: string
  }
}
```

### `CadreConfig` - Configuration Cadres

```typescript
interface CadreConfig {
  enabled: boolean
  backgroundColor: string
  borderRadius: number
  borderRadiusEnabled?: boolean  // Contrôle si arrondi activé
  padding: number
  syncWithGlobal?: boolean  // Si true, suit réglages globaux
  border?: {
    enabled: boolean
    color: string
    width: number
  }
}
```

**Points d'Attention :**
- ⚠️ **Deux types de boutons** : `ButtonsConfig` (ancien) et `ButtonConfig` (nouveau). Cohérence à vérifier.
- ✅ **Système de crop unifié** via `ImageItemBase` pour LogoItem et PhotoItem
- ✅ **Cadres configurables** avec synchronisation globale optionnelle

---

## 🛣️ Routes et Pages

### Routes Publiques (`/app/`)

| Route | Type | État | Description |
|-------|------|------|-------------|
| `/` | Page | ✅ Fonctionnel | Landing page simple avec lien vers login |
| `/login` | Page | ✅ Fonctionnel | Page de connexion |
| `/test-crop` | Page | 🔧 Dev | Page de test pour le crop |
| `/test-icons` | Page | 🔧 Dev | Page de test pour les icônes |

### Routes Public Concertations (`/app/c/[slug]/`)

| Route | Type | État | Description |
|-------|------|------|-------------|
| `/c/[slug]/` | Page | ✅ Fonctionnel | Page publique de concertation |
| `/c/[slug]/q/[questionIndex]` | Page | ✅ Fonctionnel | Page de question publique |
| `/c/[slug]/merci` | Page | ✅ Fonctionnel | Page de remerciement après participation |
| `/c/[slug]/layout` | Layout | ✅ Fonctionnel | Layout pour routes publiques |

### Routes Dashboard (`/app/dashboard/`)

| Route | Type | État | Description |
|-------|------|------|-------------|
| `/dashboard` | Page | ✅ Fonctionnel | Dashboard principal |
| `/dashboard/concertations` | Page | ✅ Fonctionnel | Liste des concertations |
| `/dashboard/concertations/resultats` | Page | ✅ Fonctionnel | Liste des résultats |
| `/dashboard/concertations/resultats/[id]` | Page | ✅ Fonctionnel | Résultats d'une concertation spécifique |

### Tunnel de Création (`/app/dashboard/concertations/creer/`)

| Route | Type | État | Description | Système Utilisé |
|-------|------|------|-------------|-----------------|
| `/creer/accueil` | Page | ✅ **ACTIF** | **Builder V6 principal** avec PhonePreview | ✅ design-v6.ts |
| `/creer/design` | Page | ⚠️ **ANCIEN** | Ancien éditeur de design (à migrer ?) | ❌ design.ts |
| `/creer/questionnaire` | Page | ✅ Fonctionnel | Édition du questionnaire | - |
| `/creer/remerciement` | Page | ✅ Fonctionnel | Édition du message de remerciement | - |
| `/creer/affiche` | Page | ✅ Fonctionnel | Aperçu et export de l'affiche | - |
| `/creer/export` | Page | ✅ Fonctionnel | Export final de la concertation | - |

**⚠️ PROBLÈME IDENTIFIÉ :**
- La route `/creer/design/page.tsx` utilise encore l'ancien système `design.ts`
- La route `/creer/accueil/page.tsx` utilise le nouveau système `design-v6.ts`
- **Incohérence** : deux systèmes coexistent pour la même fonctionnalité

### Routes API (`/app/api/`)

| Route | Type | État | Description |
|-------|------|------|-------------|
| `/api/concertations` | API | ✅ Fonctionnel | CRUD concertations |
| `/api/concertations/[id]` | API | ✅ Fonctionnel | Opérations sur une concertation |
| `/api/questions` | API | ✅ Fonctionnel | CRUD questions |
| `/api/questions/[id]` | API | ✅ Fonctionnel | Opérations sur une question |
| `/api/remerciements` | API | ✅ Fonctionnel | CRUD remerciements |
| `/api/remerciements/[id]` | API | ✅ Fonctionnel | Opérations sur un remerciement |
| `/api/upload` | API | ✅ Fonctionnel | Upload de fichiers |
| `/api/admin/reset-buttons` | API | ✅ Fonctionnel | Reset des boutons (admin) |

---

## 📦 Dépendances Clés

### Packages UI
- `lucide-react` (^0.294.0) - Icônes
- `tailwindcss` (^3.3.0) - CSS framework
- Pas de shadcn/ui ou radix visible dans package.json

### Packages Éditeur de Texte
- `@tiptap/react` (^3.7.2) - Éditeur de texte riche
- `@tiptap/starter-kit` (^3.7.2) - Extensions de base
- `@tiptap/extension-text-align` (^3.7.2) - Alignement texte
- `@tiptap/extension-underline` (^3.7.2) - Soulignement

### Packages Drag & Drop
- `@dnd-kit/core` (^6.1.0) - Core drag & drop
- `@dnd-kit/sortable` (^8.0.0) - Sortable lists
- `@dnd-kit/utilities` (^3.2.2) - Utilitaires

### Packages Image & Crop
- `react-advanced-cropper` (^0.20.1) - Cropper avancé
- `react-image-crop` (^11.0.10) - Cropper simple
- `konva` (^10.0.7) - Canvas 2D
- `react-konva` (^18.2.10) - React wrapper pour Konva
- `use-image` (^1.1.4) - Hook pour chargement images
- `fabric` (^5.3.0) - Framework canvas (peut-être non utilisé ?)

### Packages PDF/Export
- `@react-pdf/renderer` (^3.4.0) - Génération PDF
- `qrcode` (^1.5.3) - Génération QR codes

### Packages Backend
- `@supabase/ssr` (^0.5.2) - Supabase SSR
- `@supabase/supabase-js` (^2.39.1) - Client Supabase

### Packages State Management
- `zustand` (^4.5.5) - State management léger

### Packages Utilitaires
- `uuid` (^13.0.0) - Génération UUID
- `@use-gesture/react` (^10.3.1) - Gestes (peut-être non utilisé ?)

### Framework
- `next` (14.2.33) - Next.js 14
- `react` (^18.2.0) - React 18
- `typescript` (^5) - TypeScript 5

**Points d'Attention :**
- ⚠️ **Deux packages de crop** : `react-advanced-cropper` et `react-image-crop` (lequel est utilisé ?)
- ⚠️ **Deux frameworks canvas** : `konva` et `fabric` (fabric peut-être non utilisé ?)
- ⚠️ **Package `@use-gesture/react`** : à vérifier s'il est utilisé

---

## ⚙️ Fichiers de Configuration

### `package.json`
- ✅ **Présent** - Configuration complète avec toutes les dépendances
- Scripts : `dev`, `build`, `start`, `lint`

### `next.config.mjs`
- ✅ **Présent** - Configuration Next.js minimale (vide, valeurs par défaut)

### `tailwind.config.ts`
- ✅ **Présent** - Configuration Tailwind standard avec variables CSS personnalisées
- Content paths : `./pages/**/*`, `./components/**/*`, `./app/**/*`

### `tsconfig.json`
- ✅ **Présent** - Configuration TypeScript stricte avec paths `@/*`
- Module resolution : `bundler`
- JSX : `preserve`

### `.env.local`
- ❌ **Absent** - Pas de fichier visible (peut être dans `.gitignore`)
- Variables probablement nécessaires :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (côté serveur)

### `postcss.config.mjs`
- ✅ **Présent** (mentionné dans la structure)

### `middleware.ts`
- ✅ **Présent** à la racine (probablement pour auth Supabase)

---

## ⚠️ Points d'Attention

### 🔴 Critiques

1. **Deux systèmes de design coexistent**
   - `/types/design.ts` (ancien) utilisé par `/creer/design/page.tsx`
   - `/types/design-v6.ts` (nouveau) utilisé par `/creer/accueil/page.tsx`
   - **Action requise** : Migrer `/creer/design` vers v6 OU supprimer si obsolète

2. **5 builders sont des stubs**
   - `ButtonsBuilder`, `TextBuilder`, `LogoHeaderBuilder`, `PhotoBuilder`, `LogosPartenairesBuilder`
   - Affichent uniquement "Builder en cours de développement..."
   - **Action requise** : Implémenter ces builders OU utiliser les éditeurs inline uniquement

3. **Nombreux fichiers de backup**
   - 28+ fichiers `.backup` dans `/components/builder-v6/`
   - Ralentit la navigation et la compréhension
   - **Action suggérée** : Nettoyer les backups anciens

### 🟡 Moyens

4. **Deux types de configuration bouton**
   - `ButtonsConfig` (ancien avec button1Text, button2Text)
   - `ButtonConfig` (nouveau avec propriétés avancées)
   - Les deux existent dans `DesignConfigV6`
   - **Action suggérée** : Clarifier lequel utiliser

5. **Packages potentiellement non utilisés**
   - `fabric` (^5.3.0) - Framework canvas, vérifier utilisation
   - `@use-gesture/react` (^10.3.1) - Gestes, vérifier utilisation
   - `react-advanced-cropper` vs `react-image-crop` - Les deux installés, lequel utilisé ?

6. **Composants builder/vs builder-v6**
   - `/components/builder/` contient encore l'ancien système
   - Vérifier s'il est utilisé ou peut être supprimé

### 🟢 Mineurs

7. **Fichiers de documentation multiples**
   - Plusieurs fichiers `.md` d'analyse dans la racine
   - `ANALYSE_CROP_FICHIERS.md`, `COMPARAISON_LOGO_VS_PHOTO.md`, etc.
   - **Action suggérée** : Organiser dans `/docs/`

8. **Scripts PowerShell dans la racine**
   - `fix-etape1-background-position.ps1`, `install-crop-resize.ps1`, etc.
   - **Action suggérée** : Déplacer dans `/scripts/`

9. **Fichiers de backup de types**
   - `design-v6.ts.backup_*` dans `/types/`
   - **Action suggérée** : Nettoyer si obsolètes

---

## 🎯 Prochaines Étapes Suggérées

### Priorité 1 - Stabilisation

1. **Unifier les systèmes de design**
   - Décider : migrer `/creer/design` vers v6 OU le supprimer
   - Si migration : adapter la page pour utiliser `design-v6.ts` et les composants builder-v6
   - Si suppression : rediriger vers `/creer/accueil`

2. **Compléter les builders stub**
   - Implémenter `LogoHeaderBuilder` (ou confirmer que LogoHeaderInlineEditor suffit)
   - Implémenter `PhotoBuilder` (ou confirmer que PhotoInlineEditor suffit)
   - Implémenter `LogosPartenairesBuilder`
   - Implémenter `ButtonsBuilder` pour `ButtonConfig`
   - Implémenter `TextBuilder` pour `explanationCourte` et `texteObligatoire`

3. **Clarifier la configuration bouton**
   - Supprimer `ButtonsConfig` si obsolète
   - OU adapter `ButtonInlineEditor` pour gérer les deux boutons
   - Mettre à jour `DesignConfigV6` en conséquence

### Priorité 2 - Nettoyage

4. **Nettoyer les fichiers de backup**
   - Déplacer les backups récents vers `/backups/`
   - Supprimer les backups très anciens (> 1 mois)
   - Mettre en place un script de nettoyage automatique

5. **Auditer les packages non utilisés**
   - Vérifier usage de `fabric`, `@use-gesture/react`
   - Décider entre `react-advanced-cropper` et `react-image-crop`
   - Supprimer les packages non utilisés

6. **Organiser la structure**
   - Déplacer les scripts PowerShell vers `/scripts/`
   - Déplacer les docs d'analyse vers `/docs/`
   - Nettoyer les anciens composants `/components/builder/` si non utilisés

### Priorité 3 - Amélioration

7. **Documentation**
   - Créer un guide d'utilisation du builder-v6
   - Documenter l'architecture des composants inline vs builders
   - Ajouter des JSDoc aux composants complexes (ImageCropCanvas, ExplanationLongueInlineEditor)

8. **Tests**
   - Ajouter des tests unitaires pour les hooks (`useBuilder`, `useDesignHistory`)
   - Tests d'intégration pour le flux de création
   - Tests E2E pour le tunnel de création

9. **Performance**
   - Optimiser `ExplanationLongueInlineEditor` (483 lignes, composant lourd)
   - Lazy loading pour `ImageCropCanvas`
   - Memoization des composants de preview

---

## 📈 Estimation de Complétion

### Builder V6 Global : **~70%**

**Détaillé par rubrique :**

| Rubrique | Éditeur Inline | Builder | État Global |
|----------|----------------|---------|-------------|
| `logoHeader` | ✅ Complet | ❌ Stub | ⚠️ 50% |
| `titre` | ✅ Complet | ✅ Complet | ✅ 100% |
| `photo` | ✅ Complet | ❌ Stub | ⚠️ 50% |
| `explanationCourte` | ✅ Complet | ❌ Stub | ⚠️ 50% |
| `explanationLongue` | ✅ Complet | ❌ Stub | ⚠️ 50% |
| `bouton` | ✅ Complet | ❌ Stub | ⚠️ 50% |
| `texteObligatoire` | ✅ Complet | ❌ Stub | ⚠️ 50% |
| `logosPartenaires` | ✅ Complet | ❌ Stub | ⚠️ 50% |
| `fond` | N/A | ✅ Complet | ✅ 100% |

**Note :** Les éditeurs inline sont complets et fonctionnels. Les builders stub ne sont peut-être pas nécessaires si l'édition inline est suffisante. À évaluer selon les besoins UX.

---

## 📝 Notes Finales

Le projet PURPL V3 montre une **architecture solide** avec :
- ✅ Système de design V6 bien structuré avec types TypeScript complets
- ✅ Éditeurs inline fonctionnels et complets
- ✅ Système d'historique undo/redo implémenté
- ✅ Composants de crop et resize d'images robustes
- ✅ Intégration Supabase pour le backend

**Points à améliorer :**
- ⚠️ Unifier les deux systèmes de design
- ⚠️ Compléter ou supprimer les builders stub
- ⚠️ Nettoyer les fichiers de backup
- ⚠️ Auditer et optimiser les dépendances

**Conclusion :** Le projet est **fonctionnel à ~70%** avec une base solide. Les prochaines étapes devraient se concentrer sur l'unification et le nettoyage avant d'ajouter de nouvelles fonctionnalités.

---

*Audit réalisé le 10 Janvier 2026*

