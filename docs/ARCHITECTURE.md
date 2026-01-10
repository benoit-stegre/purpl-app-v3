# 🏗️ ARCHITECTURE - PURPL Solutions

## Vue d'ensemble

PURPL est une plateforme SaaS multi-tenant de gestion de consultations et questionnaires, permettant aux clients de créer et gérer leurs propres questionnaires avec un branding personnalisé.

## Stack Technique

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Composants UI personnalisés

**Backend:**
- Next.js API Routes (migration vers Supabase client direct)
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security (RLS) pour isolation multi-tenant

**Outils:**
- Génération PDF
- Export CSV
- Drag & drop form builder

## Architecture Multi-Tenant

### Principe de Base
Chaque client a ses propres données isolées via RLS policies dans Supabase.

### Isolation des Données
```
clients (table principale)
  └── concertations (consultations)
       └── questionnaires
            └── questions
                 └── reponses
```

**RLS Policy Pattern:**
```sql
-- Exemple pour la table questionnaires
CREATE POLICY "Users can only access their client's questionnaires"
ON questionnaires
FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM user_clients 
    WHERE user_id = auth.uid()
  )
);
```

## Structure des Routes

### Routes Dashboard (Admin)
```
/dashboard
  /concertation
    /vos-concertations          # Liste des concertations
    /[id]                        # Détail concertation
      /questionnaires
        /[questionnaire_id]      # Gestion questionnaire
```

### Routes Publiques
```
/questionnaire/[slug]            # Questionnaire public avec branding client
```

### Routes API (Legacy - en migration)
```
/api
  /concertations/*               # À migrer vers Supabase client
  /questionnaires/*              # À migiger vers Supabase client
```

## Système de Branding

### Double Branding
1. **PURPL Branding:** Interface admin (/dashboard)
2. **Client Branding:** Interface publique questionnaires (couleurs, logo, domaine custom)

### Implémentation
- ThemeProvider avec configuration par client
- Logo switching basé sur contexte (admin vs public)
- Variables CSS dynamiques pour couleurs client

## Authentification

**Flow:**
1. Utilisateur se connecte via Supabase Auth
2. Session stockée dans cookie
3. Middleware Next.js vérifie auth sur routes protégées
4. RLS policies vérifient automatiquement les permissions

**Providers supportés:**
- Email/Password
- Magic Links
- OAuth (Google, etc.)

## Base de Données - Relations Principales

```
users (Supabase Auth)
  ↓
user_clients (many-to-many)
  ↓
clients
  ↓
concertations
  ↓
questionnaires
  ↓
questions
  ↓
reponses
```

## Composants Clés

### QuestionEditor
- Drag & drop builder
- Gestion types de questions (choix multiple, texte libre, échelle, etc.)
- Preview en temps réel

### PDF Generator
- Export réponses questionnaire
- Template personnalisable
- Branding client inclus

### CSV Exporter
- Export données réponses
- Format compatible Excel
- Filtres et sélection colonnes

### Builder V6 - Système d'Édition Visuelle

**Architecture globale:**
Le builder V6 est un système d'édition inline inspiré de Figma/Canva permettant de créer des pages visuelles (accueil, remerciement, affiche) pour les campagnes de consultation.

**Composants principaux:**
- `PhonePreview.tsx` - Prévisualisation mobile en temps réel
- `SidePanel.tsx` - Panneau latéral avec éditeurs contextuels
- `FloatingToolbar.tsx` - Barre d'outils flottante au survol
- `*InlineEditor.tsx` - Éditeurs inline pour chaque type de contenu

**Types de contenu éditable:**
1. **Titre** - TitreInlineEditor
2. **Textes** - ExplanationCourteInlineEditor, ExplanationLongueInlineEditor
3. **Logo** - LogoHeaderInlineEditor avec LogoItemWithCrop
4. **Boutons** - Configuration couleurs et textes
5. **Fond** - Couleur ou image
6. **Photos** - Upload et crop

---

## 🖼️ SYSTÈME DE CROP/RESIZE DES IMAGES [✅ RÉSOLU]

### Contexte

Le système de crop/resize permet aux utilisateurs de:
1. **Resize** les images (simple clic → poignées rondes aux 4 coins)
2. **Crop** les images (double-clic → poignées bleues sur les 4 côtés)

**Workflow utilisateur:**
```
Upload image → Resize (ajuster taille) → Crop (ajuster cadrage) → Sauvegarde
```

### Architecture Implémentée (Viewport Model - Figma/Canva)

**Date de résolution:** 27 octobre 2025  
**Statut:** ✅ RÉSOLU - Système fonctionnel

**Structure de données finale:**
```typescript
// types/design-v6.ts
interface LogoItem {
  id: string
  url: string
  
  // SOURCE: Dimensions originales préservées (immuables)
  sourceWidth: number    // Largeur image originale
  sourceHeight: number   // Hauteur image originale
  
  // DISPLAY: Dimensions d'affichage (modifiables via resize)
  displayWidth: number   // Largeur affichée
  displayHeight: number  // Hauteur affichée
  
  // CROP: Zone visible en pixels source (viewport)
  crop: {
    x: number      // Position X dans l'image source
    y: number      // Position Y dans l'image source
    width: number  // Largeur du viewport
    height: number // Hauteur du viewport
  }
  
  order: number
}
```

**Composants modifiés:**
1. `lib/utils/image.ts` - Nouvelle fonction `compressImageWithMetadata()`
2. `LogoItem.tsx` - **Refonte complète** avec CSS background
3. `LogoItemWithCrop.tsx` - Crop handles indépendants
4. `LogoHeaderInlineEditor.tsx` - Synchronisation state + event timing

**Fonctionnalités implémentées:**
- ✅ Upload avec préservation dimensions source
- ✅ Mode resize (simple clic, poignées rondes proportionnelles)
- ✅ Mode crop (double-clic, poignées bleues indépendantes)
- ✅ Sauvegarde crop en cliquant à l'extérieur
- ✅ Affichage visuel du crop appliqué
- ✅ Container redimensionné selon zone croppée

### Solution Technique Implémentée

**Calculs d'affichage avec viewport:**
```typescript
// LogoItem.tsx - Calcul des positions
const displayScale = displayWidth / sourceWidth

const cropX = crop.x * displayScale
const cropY = crop.y * displayScale
const bgWidth = sourceWidth * displayScale
const bgHeight = sourceHeight * displayScale

// Affichage via CSS background (précis)
<div
  style={{
    width: displayWidth,
    height: displayHeight,
    backgroundImage: `url(${url})`,
    backgroundPosition: `-${cropX}px -${cropY}px`,
    backgroundSize: `${bgWidth}px ${bgHeight}px`,
    backgroundRepeat: 'no-repeat'
  }}
/>
```

**Avantages de cette approche:**
- ✅ CSS background > img tag pour contrôle précis
- ✅ Calculs basés sur dimensions source (non destructif)
- ✅ Séparation claire source/display/crop
- ✅ Resize indépendant du crop
- ✅ Compatible avec undo/redo futur

### Problématiques Résolues

**✅ PROBLÈME #1: Compression Destructive → RÉSOLU**
```typescript
// lib/utils/image.ts - Nouvelle fonction
export async function compressImageWithMetadata(file: File) {
  const { blob, originalWidth, originalHeight } = await compressImage(file)
  
  return {
    blob,
    sourceWidth: originalWidth,   // ✅ Dimensions préservées
    sourceHeight: originalHeight
  }
}
```

**✅ PROBLÈME #2: Structure Ambiguë → RÉSOLU**
```typescript
interface LogoItem {
  sourceWidth: number    // ✅ Clair: dimensions originales
  sourceHeight: number   
  displayWidth: number   // ✅ Clair: dimensions affichage
  displayHeight: number
  crop: { ... }         // ✅ Séparé et explicite
}
```

**✅ PROBLÈME #3: Calculs Basés sur Mauvaises Dimensions → RÉSOLU**
```typescript
// LogoItem.tsx - Calculs corrects
const displayScale = displayWidth / sourceWidth  // ✅ Basé sur source
const cropX = crop.x * displayScale             // ✅ Viewport correct
```

### Architecture Viewport Model

**Inspiration:** Figma, Canva, Photoshop

**Principe:**
```
┌─────────────────────────────────────┐
│  IMAGE SOURCE (immuable)            │
│  1200x800px                         │
│  ┌─────────────────┐                │
│  │   VIEWPORT      │                │  ← Zone visible
│  │   400x300px     │                │     (crop)
│  └─────────────────┘                │
└─────────────────────────────────────┘
         ↓
┌─────────────────┐
│   DISPLAY       │  ← Affichage final
│   200x150px     │     (redimensionné)
└─────────────────┘
```

**Nouvelle structure proposée:**
```typescript
interface LogoItem {
  id: string
  url: string
  
  // SOURCE: Dimensions originales (immuables)
  sourceWidth: number
  sourceHeight: number
  
  // DISPLAY: Dimensions affichage
  displayWidth: number
  displayHeight: number
  
  // CROP: Zone visible en pixels source
  crop: {
    x: number      // Position X dans l'image source
    y: number      // Position Y dans l'image source
    width: number  // Largeur du viewport
    height: number // Hauteur du viewport
  }
  
  order: number
}
```

**Avantages:**
- ✅ Séparation claire source/display/crop
- ✅ Données source préservées (non destructif)
- ✅ Crop basé sur dimensions réelles
- ✅ Resize indépendant du crop
- ✅ Compatible avec undo/redo futur

### Migration Effectuée (25-27 octobre 2025)

**Méthodologie appliquée:** Approche progressive (1 fichier = 1 test = 1 validation)

**✅ ÉTAPE 1: Fix Upload/Import** (25 oct)
- Fichier modifié: `lib/utils/image.ts`
- Fonction créée: `compressImageWithMetadata()`
- Migration: LogoHeaderInlineEditor, ImageUploader, LogosPartenairesBlock
- **Résultat:** Upload préserve sourceWidth/Height ✅

**✅ ÉTAPE 2: Fix Interactions** (25 oct)
- Fichier modifié: `LogoHeaderInlineEditor.tsx`
- Ajout: useEffect synchronisation activeRubrique + activeLogoId
- **Résultat:** Handles apparaissent au premier clic ✅

**✅ ÉTAPE 3a: Refonte Affichage** (27 oct - conv ad9f17b1)
- Fichier modifié: `LogoItem.tsx` (refonte complète)
- Implementation: viewport model + CSS background
- **Résultat:** Crop s'affiche visuellement ✅

**✅ ÉTAPE 3b: Fix Container Resize** (27 oct - conv 1021684c)
- Fichier modifié: `LogoItemWithCrop.tsx`
- Fix: Calculs basés sur dimensions source
- Ajout: Comparaison prev crop pour éviter recalculs
- **Résultat:** Container s'adapte à la zone croppée ✅

**⏸️ ÉTAPE 4: Migration Données** (reportée)
- Backward compatibility OK (ancienne structure toujours supportée)
- Migration BDD pas nécessaire pour l'instant

**🎯 ÉTAPE 5: Polish** (partiellement fait)
- ✅ Crop/resize fonctionnel
- 🟡 One-click toolbar+handles (à polir)
- 🟡 FloatingToolbar boutons (à traiter)

### Contraintes Techniques

**❌ À NE JAMAIS FAIRE:**
1. Modifier plusieurs fichiers simultanément
2. Changer interface sans backward compatibility
3. Utiliser scripts PowerShell complexes "tout-en-un"
4. Avancer sans tester chaque étape
5. Changer le comportement existant sans validation

**✅ À TOUJOURS FAIRE:**
1. Backups automatiques avant chaque modification
2. Tests immédiats après chaque changement
3. Scripts PowerShell simples (1 action = 1 script)
4. Validation utilisateur entre chaque étape
5. Documentation de chaque changement

### Références

**Conversations importantes:**

**Échecs (7-25 oct):**
- [Diagnostic initial](https://claude.ai/chat/589603c3-38cd-4700-8762-6b6d5fbea579) - Tentative #1
- [Recherches Figma](https://claude.ai/chat/120da904-5db7-42c2-85aa-6be22995ab37) - Tentative #2
- [Tentatives fixes](https://claude.ai/chat/6cc3356b-bbec-43e1-9e78-8428619c4cf4) - Tentatives #3-4
- [Refonte catastrophique](https://claude.ai/chat/90be7751-0fc7-47f0-aa0c-6f8854df985f) - Tentative #5

**Succès (25-27 oct):**
- [Approche progressive](https://claude.ai/chat/c24a5133-d7e3-4b89-a640-063afad4a02c) - Démarrage
- [ÉTAPE 1](https://claude.ai/chat/72a1b2a6-baa8-4f3d-812c-1ae6077e283a) - Upload fix
- [ÉTAPE 2](https://claude.ai/chat/2efc8dcd-35f7-4841-9aeb-d94050259a56) - Interaction fix
- [BREAKTHROUGH](https://claude.ai/chat/ad9f17b1-feb9-484d-b9a4-4c9e3af1bdbc) - 🎉 Crop fonctionne !
- [FINITION](https://claude.ai/chat/1021684c-5e3e-4207-b0d4-8b2c2bd080c0) - Container resize fix

**Documentation détaillée:**
- Voir `ISSUES.md` section "🔥 CROP/RESIZE [✅ RÉSOLU]" pour historique complet (16 tentatives)

---

## Patterns de Code

### Server Components vs Client Components
```typescript
// Server Component (par défaut)
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const { data } = await supabase.from('concertations').select()
  return <ConcertationList data={data} />
}

// Client Component (interactivité)
// components/ConcertationList.tsx
'use client'
export function ConcertationList({ data }) {
  const [filter, setFilter] = useState('')
  // ...
}
```

### Supabase Client Usage
```typescript
// Préférer l'usage direct du client Supabase
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('questionnaires')
  .select('*, questions(*)')
  .eq('client_id', clientId)
```

## Sécurité

### RLS (Row Level Security)
- ✅ Activé sur TOUTES les tables sensibles
- ✅ Policies pour SELECT, INSERT, UPDATE, DELETE
- ✅ Vérification automatique du client_id

### Validation
- Zod schemas pour validation données
- Server-side validation obligatoire
- Client-side pour UX

### CORS & CSP
- Headers sécurisés dans next.config.js
- Restrictions sur domaines autorisés

## Performance

### Optimisations
- Server Components pour réduire JS client
- Image optimization Next.js
- Lazy loading composants lourds
- Pagination sur listes longues

### Caching
- Static generation quand possible
- Revalidation strategy par route
- Supabase query caching

## Déploiement

**Environnements:**
- Development: localhost:3000
- Staging: [À définir]
- Production: [À définir]

**CI/CD:**
- [À définir - Vercel ? Autre ?]

## Problèmes Connus & Solutions

### Erreurs 401 Unauthorized
**Cause:** Mauvaise config auth ou session expirée  
**Solution:** Vérifier cookie Supabase, refresh token

### Import Paths Bracket Issues
**Cause:** Chemins avec [id] dans imports  
**Solution:** Utiliser chemins relatifs ou aliases

### RLS Policies Bloquent Tests
**Cause:** Tests sans auth context  
**Solution:** Service role key pour tests ou mock auth

### Crop/Resize Logos [✅ RÉSOLU]
**Cause:** Architecture ambiguë (dimensions source/display mélangées)  
**Solution:** Migration progressive vers viewport model avec CSS background (voir section dédiée)  
**Statut:** ✅ RÉSOLU (27 oct 2025) - Système fonctionnel avec 2 bugs mineurs à polir

## Prochaines Évolutions

- [ ] Migration complète API routes → Supabase client
- [x] ✅ Fix système crop/resize (résolu 27 oct - approche progressive en 4 étapes)
- [ ] WebSocket pour notifications temps réel
- [ ] Analytics dashboard
- [ ] API publique pour intégrations
- [ ] Mobile app (React Native ?)

---

**Dernière mise à jour:** 2025-10-28  
**Maintenu par:** PURPL Solutions Team