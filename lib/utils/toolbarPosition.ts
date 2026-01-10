/**
 * Calcule la position standardisée pour toutes les toolbars
 * - 10px du bord droit de l'avatar
 * - Aligné avec le haut de l'avatar
 * 
 * @returns Position { top, left } ou null si l'avatar n'est pas trouvé
 */
export function getStandardToolbarPosition(): { top: number; left: number } | null {
  // Méthode 1 : Chercher par classe (le plus fiable)
  let phonePreview = document.querySelector('.phone-preview-container')
  
  // Méthode 2 : Fallback - chercher parmi les éléments avec width 395px celui qui contient phone-scrollable
  // (c'est le PhonePreview, pas le wrapper qui a un transform scale)
  if (!phonePreview) {
    const containers = document.querySelectorAll('[style*="width: 395px"]')
    for (const container of containers) {
      // Le PhonePreview contient .phone-scrollable, le wrapper non
      if (container.querySelector('.phone-scrollable')) {
        phonePreview = container
        break
      }
    }
  }
  
  // Méthode 3 : Dernier recours - utiliser le sélecteur original (comme avant)
  // Prendre le premier élément trouvé (c'était comme ça avant et ça fonctionnait)
  if (!phonePreview) {
    phonePreview = document.querySelector('[style*="width: 395px"]')
  }
  
  if (!phonePreview) {
    return null
  }

  const phoneRect = phonePreview.getBoundingClientRect()
  
  // Vérifier que c'est bien le bon élément (doit avoir une hauteur de ~832px)
  if (phoneRect.height < 500) {
    // Essayer de trouver le bon élément
    const allContainers = Array.from(document.querySelectorAll('[style*="width: 395px"]'))
    for (const container of allContainers) {
      const rect = container.getBoundingClientRect()
      if (rect.height > 500 && container.querySelector('.phone-scrollable')) {
        phonePreview = container
        const correctRect = phonePreview.getBoundingClientRect()
        return {
          top: correctRect.top,
          left: correctRect.right + 10
        }
      }
    }
    return null
  }
  
  return {
    top: phoneRect.top,
    left: phoneRect.right + 10 // 10px du bord droit de l'avatar
  }
}

/**
 * Helper pour obtenir la position avec fallback automatique
 * Réessaye après un court délai si l'avatar n'est pas trouvé immédiatement
 * 
 * @param setPosition Fonction pour définir la position
 */
export function getStandardToolbarPositionWithFallback(
  setPosition: (position: { top: number; left: number }) => void
): void {
  // Essayer immédiatement
  const position = getStandardToolbarPosition()
  
  if (position) {
    setPosition(position)
    return
  }
  
  // Si pas trouvé, réessayer après un court délai (DOM peut ne pas être prêt)
  // Utiliser requestAnimationFrame pour s'assurer que le DOM est rendu
  requestAnimationFrame(() => {
    const retryPosition = getStandardToolbarPosition()
    if (retryPosition) {
      setPosition(retryPosition)
    } else {
      // Dernier essai après un petit délai
      setTimeout(() => {
        const finalPosition = getStandardToolbarPosition()
        if (finalPosition) {
          setPosition(finalPosition)
        }
      }, 100)
    }
  })
}

