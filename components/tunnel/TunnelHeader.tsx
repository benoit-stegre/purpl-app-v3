"use client"

import type React from "react"
import { Redo2, Undo2, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef } from "react"

interface TunnelHeaderProps {
  step?: number
  totalSteps?: number
  stepTitle?: string
  nextLabel?: string
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  saveStatus?: "saved" | "saving" | "unsaved"
  onPrevious?: () => void
  onNext?: () => void
  previousDisabled?: boolean
  concertationName?: string
  onNameChange?: (name: string) => void
}

export function TunnelHeader({
  step = 1,
  totalSteps = 4,
  stepTitle = "Page d'accueil",
  nextLabel = "Questionnaire",
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  saveStatus = "saved",
  onPrevious,
  onNext,
  previousDisabled = false,
  concertationName = "Nouvelle concertation",
  onNameChange,
}: TunnelHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(concertationName)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDoubleClick = () => {
    setEditValue(concertationName)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSave = () => {
    if (editValue.trim() && editValue !== concertationName) {
      onNameChange?.(editValue.trim())
    } else {
      setEditValue(concertationName)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(concertationName)
      setIsEditing(false)
    }
  }

  return (
    <div
      className="flex items-center justify-between px-6"
      style={{
        backgroundColor: "#EDEAE3",
        borderBottomColor: "#D6CCAF",
        borderBottomWidth: "1px",
        height: "56px",
      }}
    >
      {/* LEFT - Concertation name + Step indicator */}
      <div className="flex items-center gap-4">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-sm font-semibold px-2 py-1 rounded border-[1px]"
            style={{
              borderColor: "#ED693A",
              color: "#2F2F2E",
              backgroundColor: "#FFFFFF",
            }}
          />
        ) : (
          <>
            <span
              onClick={handleDoubleClick}
              className="text-sm font-semibold text-[#2F2F2E] cursor-pointer hover:opacity-70 transition-opacity"
            >
              {concertationName}
            </span>
            <div className="w-px h-5 bg-[#D6CCAF]" />
          </>
        )}

        <h1 className="text-xs font-normal text-[#76715A]">
          Étape {step}/{totalSteps} : {stepTitle}
        </h1>
      </div>

      {/* CENTER - Navigation buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevious}
          disabled={previousDisabled}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#76715A] hover:bg-[#76715A]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#76715A]" />
        </button>
        <button
          onClick={onNext}
          className="h-9 flex items-center gap-1.5 px-3 rounded-lg text-white text-xs font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: "#ED693A" }}
        >
          Suivant : {nextLabel}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RIGHT - Undo/Redo + Save status */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg border border-[#D6CCAF] overflow-hidden">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/50 disabled:opacity-40 transition-colors"
          >
            <Undo2 className="w-4 h-4 text-[#76715A]" />
          </button>
          <div className="w-px bg-[#D6CCAF]" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/50 disabled:opacity-40 transition-colors"
          >
            <Redo2 className="w-4 h-4 text-[#76715A]" />
          </button>
        </div>

        <span
          className="text-xs font-medium whitespace-nowrap"
          style={{
            color: saveStatus === "saved" ? "#409143" : saveStatus === "saving" ? "#76715A" : "#C23C3C",
          }}
        >
          {saveStatus === "saved" && "✓ Enregistré"}
          {saveStatus === "saving" && "Enregistrement..."}
          {saveStatus === "unsaved" && "Non enregistré"}
        </span>
      </div>
    </div>
  )
}
