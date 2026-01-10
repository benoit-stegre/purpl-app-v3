'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'

interface HeaderEditorProps {
  concertationName: string
  onNameChange: (name: string) => void
  onNextStep: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  isSaved: boolean
}

export default function HeaderEditor({ 
  concertationName, 
  onNameChange, 
  onNextStep,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isSaved
}: HeaderEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(concertationName)

  const handleDoubleClick = () => {
    setIsEditing(true)
    setTempName(concertationName)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (tempName.trim()) {
      onNameChange(tempName.trim())
    } else {
      setTempName(concertationName)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setTempName(concertationName)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        
        {/* Gauche : BOUTON MAISON | TITRE | FLÈCHES | NUAGE */}
        <div className="flex items-center gap-4 flex-1">
          
          {/* Bouton maison */}
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Retour au dashboard"
          >
            <Home className="w-5 h-5 text-purple-600" />
          </Link>

          {/* Nom de la concertation */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="text-lg font-semibold text-gray-900 border-2 border-blue-500 rounded px-3 py-1 focus:outline-none"
                placeholder="Nom de la concertation"
              />
            ) : (
              <h1 
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onDoubleClick={handleDoubleClick}
                title="Double-cliquez pour éditer"
              >
                {concertationName || 'Sans titre'}
              </h1>
            )}
          </div>

          {/* Séparateur */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Flèches undo/redo */}
          <div className="flex items-center gap-2">
            {/* Flèche retour (undo) - forme courbe comme photo */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`transition-opacity ${
                canUndo ? 'opacity-100 hover:opacity-70' : 'opacity-30 cursor-not-allowed'
              }`}
              title="Annuler (Ctrl+Z)"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>

            {/* Flèche avant (redo) - forme courbe comme photo */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`transition-opacity ${
                canRedo ? 'opacity-100 hover:opacity-70' : 'opacity-30 cursor-not-allowed'
              }`}
              title="Refaire (Ctrl+Shift+Z)"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>

          {/* Séparateur */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Nuage avec coche */}
          <div className="relative">
            <svg 
              className={`w-7 h-7 transition-colors ${isSaved ? 'text-gray-900' : 'text-gray-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            {/* Coche verte si sauvegardé */}
            {isSaved && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Droite : Bouton Étape suivante */}
        <button
          onClick={onNextStep}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Étape suivante
        </button>
      </div>
    </header>
  )
}