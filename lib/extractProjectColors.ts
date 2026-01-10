import { DesignConfigV6 } from '@/types/design-v6'

export function extractProjectColors(designConfig: DesignConfigV6): string[] {
  const colors = new Set<string>()

  // Titre
  if (designConfig.titre.color) colors.add(designConfig.titre.color)
  if (designConfig.titre.cadre?.backgroundColor) colors.add(designConfig.titre.cadre.backgroundColor)
  if (designConfig.titre.cadre?.border?.color) colors.add(designConfig.titre.cadre.border.color)

  // Explication Courte
  if (designConfig.explanationCourte.color) colors.add(designConfig.explanationCourte.color)
  if (designConfig.explanationCourte.cadre?.backgroundColor) colors.add(designConfig.explanationCourte.cadre.backgroundColor)

  // Explication Longue
  designConfig.explanationLongue.forEach(block => {
    if (block.color) colors.add(block.color)
    if (block.cadre?.backgroundColor) colors.add(block.cadre.backgroundColor)
  })

  // Boutons
  if (designConfig.buttons.textColor) colors.add(designConfig.buttons.textColor)
  if (designConfig.buttons.backgroundColor) colors.add(designConfig.buttons.backgroundColor)
  if (designConfig.buttons.border?.color) colors.add(designConfig.buttons.border.color)

  // Texte Obligatoire
  if (designConfig.texteObligatoire.color) colors.add(designConfig.texteObligatoire.color)

  // Fond
  if (designConfig.fond.type === 'color' && designConfig.fond.value) {
    colors.add(designConfig.fond.value)
  }

  // Retourner tableau sans doublons, filtrer les undefined
  return Array.from(colors).filter(c => c && c.startsWith('#'))
}