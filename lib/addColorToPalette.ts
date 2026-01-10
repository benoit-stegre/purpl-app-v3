/**
 * Ajoute une couleur à la palette du projet (max 12 couleurs)
 * @param currentColors - Tableau des couleurs actuelles
 * @param newColor - Nouvelle couleur à ajouter (#RRGGBB)
 * @returns Nouveau tableau de couleurs (max 12)
 */
export function addColorToPalette(currentColors: string[], newColor: string): string[] {
  // Vérifier que c'est une couleur valide
  if (!newColor || !newColor.startsWith('#')) {
    return currentColors
  }

  // Si la couleur existe déjà, ne rien faire
  if (currentColors.includes(newColor)) {
    return currentColors
  }

  // Ajouter la couleur
  const updatedColors = [...currentColors, newColor]

  // Limiter à 12 couleurs (garder les 12 dernières)
  if (updatedColors.length > 12) {
    return updatedColors.slice(-12)
  }

  return updatedColors
}