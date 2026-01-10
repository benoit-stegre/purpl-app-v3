'use client'

import React from 'react'

interface InlineEditorWrapperProps {
  title: string
  isEmpty: boolean
  isActive: boolean
  children: React.ReactNode
}

export default function InlineEditorWrapper({
  title,
  isEmpty,
  isActive,
  children
}: InlineEditorWrapperProps) {
  
  // Quand ACTIF : toujours la même structure (vide ou plein)
  if (isActive) {
    return (
      <div className={isEmpty ? "relative rounded-lg p-4 min-h-[120px]" : "relative"}>
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-30">
            <div className="text-center space-y-2">
              <div className="text-gray-500 font-semibold text-sm">{title}</div>
            </div>
          </div>
        )}
        <div className="relative z-20">
          {children}
        </div>
      </div>
    )
  }
  
  // Quand INACTIF ET VIDE : wrapper avec placeholder
  if (isEmpty) {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[120px] hover:border-gray-400 transition-colors">
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center space-y-2">
            <div className="text-gray-500 font-semibold text-sm">{title}</div>
            <div className="text-gray-400 text-sm">Cliquez pour ajouter</div>
          </div>
        </div>
        <div className="relative z-20" style={{ opacity: 0 }}>
          {children}
        </div>
      </div>
    )
  }

  // Quand INACTIF ET PLEIN : juste le contenu
  return <>{children}</>
}