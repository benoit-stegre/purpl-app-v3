# 📋 CONVENTIONS - PURPL Solutions

## Conventions de Code

### Langues
- **Code:** Anglais (variables, fonctions, commentaires)
- **Interface utilisateur:** Français
- **Documentation technique:** Français (pour faciliter la collaboration)

### Nommage

#### Fichiers
```
// Composants React
QuestionEditor.tsx
ConcertationList.tsx

// Pages Next.js
page.tsx
layout.tsx
loading.tsx
error.tsx

// Utilities
formatDate.ts
validateEmail.ts

// Types
types.ts ou [feature].types.ts

// Constantes
constants.ts ou [feature].constants.ts
```

#### Variables & Fonctions
```typescript
// camelCase pour variables et fonctions
const questionnaireId = '123'
const userData = await fetchUserData()

// PascalCase pour composants et types
type QuestionnaireData = { ... }
const QuestionEditor = () => { ... }

// SCREAMING_SNAKE_CASE pour constantes
const MAX_QUESTIONS_PER_FORM = 50
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
```

#### Types & Interfaces
```typescript
// Interface pour objets
interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'user'
}

// Type pour unions, utilitaires
type QuestionType = 'text' | 'choice' | 'scale'
type ApiResponse<T> = { data: T; error: null } | { data: null; error: string }

// Suffix Props pour props de composants
interface QuestionEditorProps {
  questionId: string
  onSave: (data: QuestionData) => void
}
```

## Structure des Dossiers

```
/app
  /api                         # API routes
    /concertations
    /questions
    /remerciements
    /upload
  /c
    /[slug]
  /dashboard                   # Routes protégées admin
    /concertations
  /fonts
  /login
  /test-crop
  /test-icons

/components
  /affiche
    /pdf
    /preview
  /builder
    /blocks
    /shared
  /builder-v6
    /builders
  /formulaire
  /questionnaire               # Routes publiques
  /remerciement
  /tunnel

/lib
  /constants
  /supabase                    # Config Supabase
    client.ts
    server.ts
  /utils                       # Utilitaires

/types
  design-v6.ts
  design.ts

/public
  /images
  /fonts
```

## Composants React

### Structure Standard
```typescript
'use client' // Si besoin

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { QuestionData } from '@/types'

interface QuestionEditorProps {
  questionId: string
  initialData?: QuestionData
  onSave: (data: QuestionData) => void
}

export function QuestionEditor({ 
  questionId, 
  initialData,
  onSave 
}: QuestionEditorProps) {
  // 1. Hooks
  const [data, setData] = useState(initialData)
  
  // 2. Handlers
  const handleSave = async () => {
    // validation
    // appel API
    onSave(data)
  }
  
  // 3. Render
  return (
    <div className="space-y-4">
      {/* JSX */}
    </div>
  )
}
```

### Server Components (par défaut)
```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data } = await supabase.from('concertations').select()
  
  return <ConcertationList concertations={data} />
}
```

### Client Components (interactivité nécessaire)
```typescript
'use client'

import { useState } from 'react'

export function InteractiveComponent() {
  const [state, setState] = useState()
  // ...
}
```

## TypeScript

### Configuration
- Strict mode: ✅ OBLIGATOIRE
- No implicit any: ✅ OBLIGATOIRE
- No unused vars: ⚠️ Warning

### Types Supabase
```typescript
// Utiliser les types auto-générés
import type { Database } from '@/types/database.types'

type Questionnaire = Database['public']['Tables']['questionnaires']['Row']
type QuestionnaireInsert = Database['public']['Tables']['questionnaires']['Insert']
```

### Éviter 'any'
```typescript
// ❌ Mauvais
const data: any = await fetchData()

// ✅ Bon
const data: QuestionnaireData = await fetchData()

// ✅ Acceptable si vraiment nécessaire
const data: unknown = await fetchData()
if (isQuestionnaireData(data)) {
  // type guard
}
```

## Gestion d'État

### useState pour état local
```typescript
const [isOpen, setIsOpen] = useState(false)
const [formData, setFormData] = useState<FormData>({})
```

### Server State avec Supabase
```typescript
// Préférer fetch direct dans Server Components
const { data } = await supabase.from('table').select()

// Pour Client Components: utiliser hooks custom
const { data, loading, error } = useQuestionnaires(clientId)
```

## Gestion des Erreurs

### Try/Catch
```typescript
try {
  const { data, error } = await supabase.from('table').select()
  
  if (error) throw error
  
  return data
} catch (error) {
  console.error('Erreur lors du fetch:', error)
  // Logging, toast notification, etc.
  throw error // ou return null selon contexte
}
```

### Error Boundaries
```typescript
// app/error.tsx pour catch errors React
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Quelque chose s'est mal passé</h2>
      <button onClick={reset}>Réessayer</button>
    </div>
  )
}
```

## Validation

### Zod Schemas
```typescript
import { z } from 'zod'

export const questionnaireSchema = z.object({
  title: z.string().min(3, 'Titre trop court').max(100),
  description: z.string().optional(),
  client_id: z.string().uuid(),
  questions: z.array(questionSchema).min(1, 'Au moins une question requise')
})

export type QuestionnaireFormData = z.infer<typeof questionnaireSchema>
```

### Validation Server-Side
```typescript
// TOUJOURS valider côté serveur
export async function createQuestionnaire(formData: unknown) {
  const validated = questionnaireSchema.parse(formData)
  // Continuer avec données validées
}
```

## Styling

### Tailwind CSS
```typescript
// Préférer Tailwind pour styling
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <Button className="bg-purple-600 hover:bg-purple-700">
    Sauvegarder
  </Button>
</div>
```

### Classes Conditionnelles
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
)}>
```

## Accessibilité

### Règles de Base
- Toujours `alt` sur images
- Labels sur inputs
- ARIA labels si besoin
- Navigation clavier

```typescript
<button
  aria-label="Fermer le modal"
  onClick={onClose}
>
  <XIcon />
</button>

<input
  id="question-title"
  aria-describedby="title-help"
/>
<span id="title-help">Maximum 100 caractères</span>
```

## Performance

### Lazy Loading
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Si pas besoin SSR
})
```

### Memoization
```typescript
import { useMemo, useCallback } from 'react'

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

## Git

### Commits
```
feat: ajoute export CSV des questionnaires
fix: corrige erreur 401 sur /dashboard
refactor: restructure composants formulaire
docs: met à jour ARCHITECTURE.md
style: formate code avec prettier
test: ajoute tests pour QuestionEditor
```

### Branches
```
main          # Production
develop       # Development
feature/xxx   # Nouvelles features
fix/xxx       # Bug fixes
refactor/xxx  # Refactoring
```

## Scripts PowerShell

### Règle pour Claude
Quand Benoit demande une modification de code, **TOUJOURS** fournir un script PowerShell complet qui :
- Crée les backups automatiquement
- Crée/modifie les fichiers
- Utilise des chemins complets
- Affiche des messages de progression
- Est copier-coller dans le terminal (0 interaction)

**Exemple :**
```powershell
# Backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "$file.backup_$timestamp"

# Modification
[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)

# Confirmation
Write-Host "OK Fichier mis à jour" -ForegroundColor Green
```

---

**Note:** Ces conventions évoluent avec le projet. Propose des améliorations si nécessaire !

**Dernière mise à jour:** 2025-10-24
**Version:** 2.0 (V3 avec arborescence actuelle)
---

## 🚨 RÈGLES CRITIQUES DE DÉVELOPPEMENT

### Développement Progressif (OBLIGATOIRE)

**Contexte:**
Suite aux problèmes rencontrés avec le système crop/resize (2 semaines de travail perdues, 10+ tentatives échouées), ces règles sont maintenant **OBLIGATOIRES** pour tout développement sur PURPL.

**Principe fondamental:**
```
1 ÉTAPE = 1 FICHIER = 1 TEST = 1 VALIDATION
```

### ❌ INTERDICTIONS ABSOLUES

**1. Modifications simultanées de plusieurs fichiers**
```
❌ INTERDIT
Script qui modifie:
- types/design-v6.ts
- components/LogoItem.tsx
- components/LogoItemWithCrop.tsx
- lib/utils/image.ts
→ Tout en une seule fois

✅ AUTORISÉ
Script 1: Modifie types/design-v6.ts
→ Test → Validation
Script 2: Modifie components/LogoItem.tsx
→ Test → Validation
...
```

**Raison:** Erreurs en cascade impossibles à débugger, perte du code fonctionnel.

**2. Changement d'interfaces sans backward compatibility**
```typescript
❌ INTERDIT
// Changer directement
interface LogoItem {
  sourceWidth: number  // Nouveau
  sourceHeight: number // Nouveau
  // width et height supprimés → CASSE TOUT
}

✅ AUTORISÉ
// Ajouter en gardant l'ancien
interface LogoItem {
  width: number        // Garde l'ancien
  height: number       // Garde l'ancien
  sourceWidth?: number // Ajoute le nouveau (optionnel)
  sourceHeight?: number
}
```

**Raison:** Incompatibilités entre composants, erreurs TypeScript partout.

**3. Scripts PowerShell "tout-en-un"**
```powershell
❌ INTERDIT
# Script de 500 lignes qui fait tout d'un coup
# - Modifie 10 fichiers
# - Installe des packages
# - Crée des migrations
# - Met à jour la doc
→ Impossible à débugger

✅ AUTORISÉ
# Script 1: Modifie 1 fichier (50 lignes max)
# Script 2: Installe 1 package
# Script 3: Crée 1 migration
→ Simple, clair, testable
```

**Raison:** Complexité excessive, pas de visibilité sur l'échec.

**4. Avancer sans tester**
```
❌ INTERDIT
Modification A → Modification B → Modification C → Test
→ Quelle modification a cassé ? Impossible à savoir

✅ AUTORISÉ
Modification A → Test → OK
Modification B → Test → OK
Modification C → Test → OK
→ On sait exactement ce qui marche
```

**Raison:** Accumulation d'erreurs, impossible de localiser le problème.

**5. Changer le comportement existant sans validation**
```
❌ INTERDIT
Claude: "J'ai changé l'esthétique ET le mode de fonctionnement"
→ Benoit découvre que ça ne marche plus comme avant

✅ AUTORISÉ
Claude: "Voici les modifications, l'esthétique reste identique"
Benoit: "OK" ou "Non, reviens en arrière"
→ Validation explicite avant de continuer
```

**Raison:** Perte de fonctionnalités, travail refait plusieurs fois.

### ✅ OBLIGATIONS

**1. Backups automatiques TOUJOURS**
```powershell
# AU DÉBUT de CHAQUE script
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $fichier "$fichier.backup_$timestamp"
```

**Raison:** Sécurité, rollback facile, confiance pour essayer.

**2. Validation utilisateur entre chaque étape**
```
Claude: [Propose modification A]
Benoit: "OK" ou "Fait"
Claude: [Propose modification B]
Benoit: "OK" ou "Fait"
```

**Raison:** Assurance que chaque étape fonctionne avant de continuer.

**3. Scripts PowerShell simples (1 action)**
```powershell
# BON SCRIPT
# 1. Backup
# 2. Modification d'1 fichier
# 3. Confirmation visuelle
# TOTAL: 30-50 lignes max
```

**Raison:** Compréhension immédiate, débogage facile.

**4. Documentation immédiate de TOUT**
```
Après chaque modification:
1. Note dans ISSUES.md ce qui a été fait
2. Si échec: documente la tentative et la raison
3. Si succès: documente la solution
```

**Raison:** Pas de répétition des erreurs, historique clair.

**5. Tests immédiats après chaque modification**
```
Script exécuté → Test fonctionnel → Validation → Next
```

**Raison:** Feedback immédiat, pas d'accumulation de problèmes.

### 📋 Workflow Type (MODÈLE)

**Pour ajouter/modifier une fonctionnalité:**

```
ÉTAPE 1: Analyse
├─ Identifier les fichiers concernés
├─ Lire le code existant
└─ Proposer un plan en N étapes

ÉTAPE 2: Modification fichier 1
├─ Script PowerShell simple (backup + modif)
├─ Benoit exécute
├─ Test immédiat
└─ Validation: "OK" ou "Reviens en arrière"

ÉTAPE 3: Modification fichier 2 (SI ÉTAPE 2 = OK)
├─ Script PowerShell simple
├─ Benoit exécute
├─ Test immédiat
└─ Validation: "OK" ou "Reviens en arrière"

...

ÉTAPE N: Documentation
├─ Mise à jour ISSUES.md
├─ Mise à jour ARCHITECTURE.md (si changement archi)
└─ Mise à jour CONVENTIONS.md (si nouvelle règle)
```

### ⚠️ Signaux d'Alerte

**Quand dire STOP immédiatement:**

1. ❌ Claude propose de modifier 3+ fichiers simultanément
2. ❌ Claude dit "on va tout refaire"
3. ❌ Script PowerShell fait plus de 100 lignes
4. ❌ Claude change l'interface sans plan de migration
5. ❌ Modifications sans tests intermédiaires
6. ❌ Claude dit "fais confiance, ça va marcher"

**Action:**
```
Benoit: "STOP"
Claude: Propose approche progressive
Benoit: Valide ou demande alternative
```

### 🎯 Exemples Concrets

**❌ MAUVAIS EXEMPLE (Crop/Resize - Tentative #5)**
```
Claude: Je vais refondre toute l'architecture
- Modifier types/design-v6.ts
- Modifier LogoItem.tsx
- Modifier LogoItemWithCrop.tsx
- Créer lib/utils/image-logo.ts
- Modifier image.ts
→ Tout en un script de 300 lignes

Résultat: CATASTROPHIQUE
- 50+ erreurs TypeScript
- Application cassée
- 2h de restauration
```

**✅ BON EXEMPLE (Approche Progressive - Tentative #8)**
```
Claude: On va faire en 4 étapes

ÉTAPE 1: Fix image.ts (préserver dimensions)
- 1 script simple
- Test: upload → vérifier dimensions
Benoit: "OK" → Continue

ÉTAPE 2: Fix LogoItem.tsx (affichage)
- 1 script simple
- Test: affichage → vérifier crop
Benoit: "OK" → Continue

ÉTAPE 3: Fix LogoItemWithCrop.tsx (interaction)
- 1 script simple
- Test: double-clic → crop → vérifier
Benoit: "OK" → Continue

ÉTAPE 4: Polish
- Feedback visuel
- Documentation

Résultat: SUCCÈS (en théorie, si suivi correctement)
```

### 📚 Références

**Documentation détaillée:**
- `ISSUES.md` section "🔥 CROP/RESIZE" pour historique complet
- `ARCHITECTURE.md` section "Système de Crop/Resize" pour architecture

**Conversations importantes:**
- [Refonte catastrophique](https://claude.ai/chat/90be7751-0fc7-47f0-aa0c-6f8854df985f) - À NE JAMAIS REPRODUIRE
- [Approche progressive](https://claude.ai/chat/c24a5133-d7e3-4b89-a640-063afad4a02c) - MODÈLE À SUIVRE

---

**⚠️ CES RÈGLES SONT NON NÉGOCIABLES**

Elles ont été établies après 2 semaines de travail perdu et 10+ tentatives échouées.
Tout développeur (humain ou IA) travaillant sur PURPL doit les respecter STRICTEMENT.

**Dernière mise à jour:** 2025-10-25  
**Raison:** Leçons apprises du problème crop/resize
