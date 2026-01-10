# 📋 ANALYSE COMPLÈTE : Fichiers liés au système de CROP

**Date :** 2025-01-04  
**Objectif :** Lister TOUS les fichiers contenant du code lié au CROP (pas resize)

---

## 🎯 FICHIERS ACTIFS (utilisés actuellement)

### 1. **components/builder-v6/LogoItemWithCrop.tsx**
- **Rôle :** Composant UI principal pour le crop des logos avec poignées interactives
- **Utilisé par :** `LogoHeaderInlineEditor.tsx` (ligne 6, 93)
- **Statut :** ✅ **GARDER** - Actif et utilisé
- **Fonctionnalités :**
  - Mode crop avec poignées bleues sur les 4 côtés
  - Recalcul en temps réel du container avec `tempCrop`
  - Sauvegarde du crop au clic extérieur
  - Intégration avec `LogoItem` pour affichage

---

### 2. **components/builder-v6/PhotoItemWithCrop.tsx**
- **Rôle :** Composant UI pour le crop des photos avec poignées interactives (ANCIEN)
- **Utilisé par :** ❌ **AUCUN** - Remplacé par `PhotoItemEditor.tsx`
- **Statut :** ❌ **À SUPPRIMER** - Remplacé par `PhotoItemEditor.tsx` (confirmé)
- **Fonctionnalités :**
  - Mode crop avec poignées bleues sur les 4 côtés
  - Similarité avec `LogoItemWithCrop.tsx`
- **Note :** `PhotoInlineEditor.tsx` utilise maintenant `PhotoItemEditor.tsx` (ligne 5)

---

### 3. **components/builder-v6/PhotoItemEditor.tsx**
- **Rôle :** Composant UI pour éditer les photos (inclut crop + resize)
- **Utilisé par :** `PhotoInlineEditor.tsx` (probablement)
- **Statut :** ✅ **GARDER** - Composant actif qui remplace `PhotoItemWithCrop`
- **Fonctionnalités :**
  - Gère resize ET crop dans un seul composant
  - Modes : 'normal', 'resize', 'crop'
  - Poignées de crop sur les 4 côtés

---

### 4. **types/design-v6.ts**
- **Rôle :** Définitions TypeScript pour les structures de données (LogoItem, PhotoItem)
- **Utilisé par :** Tous les composants qui manipulent des logos/photos
- **Statut :** ✅ **GARDER** - Définitions essentielles
- **Contenu lié au crop :**
  ```typescript
  interface LogoItem {
    crop: { x: number; y: number; width: number; height: number }
  }
  interface PhotoItem {
    crop: { x: number; y: number; width: number; height: number }
  }
  ```

---

### 5. **lib/utils/image-logo.ts**
- **Rôle :** Utilitaires pour créer et normaliser les LogoItem (inclut crop initial)
- **Utilisé par :** `LogoItemWithCrop.tsx` (ligne 6)
- **Statut :** ✅ **GARDER** - Fonction `createInitialLogoItem` essentielle
- **Fonctionnalités :**
  - Crée le crop initial (image complète : x:0, y:0, width/height = source)
  - Normalise les anciens formats de LogoItem

---

### 6. **lib/utils/image.ts**
- **Rôle :** Utilitaires généraux pour les images (compression, validation)
- **Utilisé par :** Plusieurs composants d'upload
- **Statut :** ✅ **GARDER** - Utilitaires généraux (pas spécifique crop, mais lié)
- **Contenu lié :**
  - `compressImageWithMetadata()` : préserve dimensions source pour système crop
  - Commentaires expliquant que le resize se fait à l'affichage, pas physiquement

---

### 7. **components/builder-v6/LogoHeaderInlineEditor.tsx**
- **Rôle :** Éditeur inline pour les logos en header (utilise LogoItemWithCrop)
- **Utilisé par :** `PhonePreview.tsx` ou builders
- **Statut :** ✅ **GARDER** - Intègre LogoItemWithCrop (lignes 6, 93-100)
- **Contenu lié au crop :**
  - Importe `LogoItemWithCrop`
  - Gère `onCropSave` pour sauvegarder le crop
  - Passe les props nécessaires au composant de crop

---

### 8. **components/builder-v6/PhotoInlineEditor.tsx**
- **Rôle :** Éditeur inline pour les photos
- **Utilisé par :** `PhonePreview.tsx` ou builders
- **Statut :** ✅ **GARDER** - Utilise probablement `PhotoItemEditor` maintenant
- **Contenu lié :** Gère le crop via `PhotoItemEditor` ou `PhotoItemWithCrop`

---

## 🗑️ FICHIERS OBSOLÈTES / NON UTILISÉS

### 9. **components/builder-v6/LogoCropModal.tsx**
- **Rôle :** Modal de crop pour logos (ancienne implémentation)
- **Utilisé par :** ❌ **AUCUN IMPORT TROUVÉ** - Non utilisé
- **Statut :** ❌ **À SUPPRIMER** - Remplacé par `LogoItemWithCrop.tsx` avec crop inline
- **Raison :** Le crop se fait maintenant inline avec poignées, plus besoin de modal

---

### 10. **components/builder-v6/ImageCropCanvas.tsx**
- **Rôle :** Composant canvas pour crop/resize d'images (implémentation expérimentale)
- **Utilisé par :** ❌ **AUCUN IMPORT TROUVÉ** - Non utilisé
- **Statut :** ❌ **À SUPPRIMER** - Expérimental, jamais intégré
- **Note :** Il existe aussi `ImageCropCanvas.tsx` à la racine (doublon)

---

### 11. **ImageCropCanvas.tsx** (racine)
- **Rôle :** Version dupliquée de `components/builder-v6/ImageCropCanvas.tsx`
- **Utilisé par :** ❌ **AUCUN IMPORT TROUVÉ** - Doublon
- **Statut :** ❌ **À SUPPRIMER** - Doublon du fichier dans builder-v6

---

### 12. **components/builder/shared/ImageCropper.tsx**
- **Rôle :** Composant de crop pour l'ancien système (builder-v1)
- **Utilisé par :** Probablement ancien système `components/builder/`
- **Statut :** ❓ **À VÉRIFIER** - Utilisé par l'ancien builder ?
- **Note :** Vérifier si `components/builder/` est encore utilisé

---

## 📦 FICHIERS DE BACKUP (à nettoyer)

### 13. **components/builder-v6/ImageCropCanvas.BACKUP-20251024-142652.tsx**
- **Statut :** 🗑️ **SUPPRIMER** - Backup

### 14. **components/builder-v6/ImageCropCanvas.BACKUP-20251024-135850.tsx**
- **Statut :** 🗑️ **SUPPRIMER** - Backup

### 15. **components/builder-v6/BACKUP_LogoItemWithCrop_20251024_083335.tsx**
- **Statut :** 🗑️ **SUPPRIMER** - Backup

### 16. **components/builder-v6/LogoItemWithCrop.tsx.backup_20251204_093008**
- **Statut :** 🗑️ **SUPPRIMER** - Backup

### 17. **components/builder-v6/PhotoItemWithCrop.tsx.backup_20251101_114357**
- **Statut :** 🗑️ **SUPPRIMER** - Backup

---

## 📄 FICHIERS DE TEST / DOCUMENTATION

### 18. **app/test-crop/page.tsx**
- **Rôle :** Page de test pour le système de crop avec react-konva
- **Utilisé par :** Développement/test uniquement
- **Statut :** ❓ **À GARDER** - Utile pour tester (peut être supprimé en production)

---

## 🔍 RÉSUMÉ PAR STATUT

### ✅ À GARDER (fichiers actifs)
1. `components/builder-v6/LogoItemWithCrop.tsx` - Crop logos inline
2. `components/builder-v6/PhotoItemEditor.tsx` - Crop photos (remplace PhotoItemWithCrop)
3. `types/design-v6.ts` - Définitions TypeScript
4. `lib/utils/image-logo.ts` - Utilitaires création logo
5. `lib/utils/image.ts` - Utilitaires images (lié mais pas spécifique)
6. `components/builder-v6/LogoHeaderInlineEditor.tsx` - Intègre crop logos
7. `components/builder-v6/PhotoInlineEditor.tsx` - Intègre crop photos

### ❌ À SUPPRIMER (non utilisés)
1. `components/builder-v6/LogoCropModal.tsx` - Ancienne modal remplacée
2. `components/builder-v6/ImageCropCanvas.tsx` - Expérimental non intégré
3. `ImageCropCanvas.tsx` (racine) - Doublon
4. `components/builder-v6/PhotoItemWithCrop.tsx` - Remplacé par PhotoItemEditor

### ❌ À SUPPRIMER (confirmé)
1. `components/builder-v6/PhotoItemWithCrop.tsx` - ✅ Confirmé : remplacé par PhotoItemEditor

### ❓ À VÉRIFIER
1. `components/builder/shared/ImageCropper.tsx` - Utilisé par ancien builder ?
2. `app/test-crop/page.tsx` - Garder ou supprimer ?

### 🗑️ À NETTOYER (backups)
- Tous les fichiers `.backup*`, `.BACKUP*`, `BACKUP_*`

---

## 📊 STATISTIQUES

- **Fichiers actifs :** 7
- **Fichiers obsolètes :** 3
- **Fichiers à vérifier :** 3
- **Backups :** 5+ (nettoyage recommandé)

---

## ✅ RECOMMANDATIONS

### Actions immédiates :
1. ✅ **GARDER** tous les fichiers actifs listés
2. ❌ **SUPPRIMER** `LogoCropModal.tsx` (non utilisé)
3. ❌ **SUPPRIMER** `ImageCropCanvas.tsx` (expérimental, non intégré)
4. ❌ **SUPPRIMER** `ImageCropCanvas.tsx` à la racine (doublon)
5. ❌ **SUPPRIMER** `PhotoItemWithCrop.tsx` (remplacé par PhotoItemEditor)
6. 🗑️ **NETTOYER** tous les fichiers de backup

### Actions à vérifier :
1. Vérifier si `components/builder/shared/ImageCropper.tsx` est utilisé par l'ancien système
2. Décider si `app/test-crop/page.tsx` doit rester en production

---

**Généré le :** 2025-01-04

