'use client'

interface AvatarOverlayProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onFondClick: () => void
}

export default function AvatarOverlay({ 
  onFondClick 
}: AvatarOverlayProps) {
  return (
    <>
      {/* Bouton + Fond d'écran en haut à droite de l'avatar */}
      <div className="absolute -top-2 -right-12 z-20">
        <button
          onClick={onFondClick}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-all shadow-sm"
          title="Modifier le fond d'écran"
        >
          <span className="text-lg font-semibold">+</span>
        </button>
      </div>
    </>
  )
}