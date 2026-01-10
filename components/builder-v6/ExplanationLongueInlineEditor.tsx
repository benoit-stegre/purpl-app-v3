'use client'

import React, { useRef, useState, useEffect } from 'react'
import { DesignConfigV6, ExplanationLongueBlock } from '@/types/design-v6'
import RichTextEditor, { RichTextEditorHandle } from './RichTextEditor'
import FloatingToolbar from './FloatingToolbar'
import SidePanel from './SidePanel'
import { useInlineEditor } from '@/hooks/useInlineEditor'
import { addColorToPalette } from '@/lib/addColorToPalette'
import { getStandardToolbarPosition } from '@/lib/utils/toolbarPosition'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

interface ExplanationLongueInlineEditorProps {
  designConfig: DesignConfigV6
  onUpdate: (updates: Partial<DesignConfigV6>) => void
}

interface SortableBlockProps {
  block: ExplanationLongueBlock
  isActive: boolean
  isOnlyBlock: boolean
  onFocus: () => void
  onDelete: () => void
  onContentChange: (html: string) => void
  onSelectionChange: (hasSelection: boolean) => void
  editorRef: React.RefObject<RichTextEditorHandle>
}

function SortableBlock({ 
  block, 
  isActive, 
  isOnlyBlock,
  onFocus, 
  onDelete,
  onContentChange,
  onSelectionChange,
  editorRef
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative group"
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute left-[-27px] top-2 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Déplacer le bloc"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex items-start">
        <div className="flex-1">
          <RichTextEditor
            ref={editorRef}
            content={block.content}
            font={block.font}
            fontSize={block.fontSize}
            color={block.color}
            textAlign={block.textAlign}
            placeholder={'Explication longue'}
            cadre={block.cadre}
            isActive={isActive}
            onFocus={onFocus}
            onBlur={() => {}}
            onChange={onContentChange}
            onSelectionChange={onSelectionChange}
          />
        </div>

        {!isOnlyBlock && (
          <button
            onClick={onDelete}
            className="absolute right-[-28px] top-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Supprimer le bloc"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function ExplanationLongueInlineEditor({
  designConfig,
  onUpdate
}: ExplanationLongueInlineEditorProps) {
  
  const containerRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  const editorRefs = useRef<Map<string, RichTextEditorHandle>>(new Map())
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  
  const { 
    activeRubrique, 
    activateRubrique, 
    deactivateRubrique,
    toolbarPosition, 
    setToolbarPosition,
    sidePanelOpen, 
    setSidePanelOpen,
    sidePanelType,
    setSidePanelType
  } = useInlineEditor()

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [tempTextColor, setTempTextColor] = useState<string | null>(null)
  const [tempBackgroundColor, setTempBackgroundColor] = useState<string | null>(null)
  const [tempBorderColor, setTempBorderColor] = useState<string | null>(null)
  const [hasSelection, setHasSelection] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const blocks = designConfig.explanationLongue.length > 0 
    ? designConfig.explanationLongue.sort((a, b) => a.order - b.order)
    : [{
        id: 'block-1',
        content: '',
        font: 'Inter',
        fontSize: 16,
        color: '#000000',
        textAlign: 'left' as const,
        order: 0,
        cadre: {
          enabled: false,
          backgroundColor: 'transparent',
          borderRadius: 8,
          padding: 16,
          border: {
            enabled: false,
            color: '#000000',
            width: 1
          }
        }
      }]

  const isActive = activeRubrique === 'explanationLongue'
  const activeBlock = blocks.find(b => b.id === activeBlockId)

  const updateBlock = (blockId: string, updates: Partial<ExplanationLongueBlock>) => {
    const newBlocks = blocks.map(b => 
      b.id === blockId ? { ...b, ...updates } : b
    )
    onUpdate({ explanationLongue: newBlocks })
  }

  const handleBlockFocus = (blockId: string) => {
    setActiveBlockId(blockId)
    // Essayer de définir la position immédiatement (synchrone)
    const position = getStandardToolbarPosition()
    if (position) {
      setToolbarPosition(position)
    }
    activateRubrique('explanationLongue')
  }

  // Mettre à jour la position quand la rubrique devient active
  useEffect(() => {
    if (!isActive) return

    const updatePosition = () => {
      const position = getStandardToolbarPosition()
      if (position) {
        setToolbarPosition(position)
      }
    }

    // Si la position n'est pas déjà définie, essayer de la trouver
    if (!toolbarPosition) {
      updatePosition()
    }

    const timeoutId = setTimeout(updatePosition, 50)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isActive, setToolbarPosition]) // Retirer toolbarPosition des dépendances pour éviter la boucle infinie

  const handleAddBlock = () => {
    const lastBlock = blocks[blocks.length - 1]
    const newBlock: ExplanationLongueBlock = {
      id: 'block-' + Date.now(),
      content: '',
      font: lastBlock.font,
      fontSize: lastBlock.fontSize,
      color: lastBlock.color,
      textAlign: lastBlock.textAlign,
      order: blocks.length,
      cadre: {
        enabled: lastBlock.cadre.enabled,
        backgroundColor: lastBlock.cadre.backgroundColor,
        borderRadius: lastBlock.cadre.borderRadius,
        padding: lastBlock.cadre.padding,
        border: lastBlock.cadre.border ? {
          enabled: lastBlock.cadre.border.enabled,
          color: lastBlock.cadre.border.color,
          width: lastBlock.cadre.border.width
        } : undefined
      }
    }
    onUpdate({ explanationLongue: [...blocks, newBlock] })
  }

  const handleDeleteBlock = (blockId: string) => {
    const newBlocks = blocks
      .filter(b => b.id !== blockId)
      .map((b, i) => ({ ...b, order: i }))
    
    if (activeBlockId === blockId) {
      setActiveBlockId(null)
      deactivateRubrique()
    }
    
    onUpdate({ explanationLongue: newBlocks })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)
      
      const reordered = arrayMove(blocks, oldIndex, newIndex)
      const withOrders = reordered.map((b, i) => ({ ...b, order: i }))
      
      onUpdate({ explanationLongue: withOrders })
    }
  }

  const handleFontChange = (font: string) => {
    if (activeBlockId) updateBlock(activeBlockId, { font })
  }

  const handleSizeChange = (fontSize: number) => {
    if (activeBlockId) updateBlock(activeBlockId, { fontSize })
  }

  const handleBoldToggle = () => {
    if (activeBlockId) {
      editorRefs.current.get(activeBlockId)?.toggleBold()
    }
  }

  const handleItalicToggle = () => {
    if (activeBlockId) {
      editorRefs.current.get(activeBlockId)?.toggleItalic()
    }
  }

  const handleUnderlineToggle = () => {
    if (activeBlockId) {
      editorRefs.current.get(activeBlockId)?.toggleUnderline()
    }
  }

  const handleColorClick = () => {
    setSidePanelType('color')
    setSidePanelOpen(true)
  }

  const handleAlignClick = () => {
    setSidePanelType('alignment')
    setSidePanelOpen(true)
  }

  const handleCadreClick = () => {
    setSidePanelType('cadre')
    setSidePanelOpen(true)
  }

  const handleColorChange = (color: string) => {
    setTempTextColor(color)
    if (activeBlockId) updateBlock(activeBlockId, { color })
  }

  const handleAlignChange = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (activeBlockId) updateBlock(activeBlockId, { textAlign: align })
  }

  const handleCadreToggle = () => {
    if (activeBlockId && activeBlock) {
      updateBlock(activeBlockId, {
        cadre: {
          ...activeBlock.cadre,
          enabled: !activeBlock.cadre.enabled
        }
      })
    }
  }

  const handleCadreChange = (cadreUpdates: any) => {
    if (activeBlockId && activeBlock) {
      if (cadreUpdates.backgroundColor && cadreUpdates.backgroundColor !== activeBlock.cadre.backgroundColor) {
        setTempBackgroundColor(cadreUpdates.backgroundColor)
      }
      
      if (cadreUpdates.border?.color && cadreUpdates.border.color !== activeBlock.cadre.border?.color) {
        setTempBorderColor(cadreUpdates.border.color)
      }
      
      updateBlock(activeBlockId, {
        cadre: {
          ...activeBlock.cadre,
          ...cadreUpdates
        }
      })
    }
  }

  const handleClose = () => {
    deactivateRubrique()
    setSidePanelOpen(false)
    setActiveBlockId(null)
  }

  useEffect(() => {
    if (!sidePanelOpen && isActive) {
      let newColors = [...designConfig.projectColors]
      
      if (tempTextColor) {
        newColors = addColorToPalette(newColors, tempTextColor)
        setTempTextColor(null)
      }
      if (tempBackgroundColor) {
        newColors = addColorToPalette(newColors, tempBackgroundColor)
        setTempBackgroundColor(null)
      }
      if (tempBorderColor) {
        newColors = addColorToPalette(newColors, tempBorderColor)
        setTempBorderColor(null)
      }
      
      if (newColors.length !== designConfig.projectColors.length) {
        onUpdate({ projectColors: newColors })
      }
    }
  }, [sidePanelOpen, isActive])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isActive) return

      const target = event.target as Node
      const clickedInContainer = containerRef.current?.contains(target)
      const clickedInToolbar = toolbarRef.current?.contains(target)
      const clickedInSidePanel = sidePanelRef.current?.contains(target)

      if (clickedInContainer || clickedInToolbar || clickedInSidePanel) {
        return
      }

      if (sidePanelOpen) {
        setSidePanelOpen(false)
      } else {
        deactivateRubrique()
        setActiveBlockId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActive, sidePanelOpen])

  return (
    <div ref={containerRef} className="relative w-full space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              ref={(el) => {
                if (el) blockRefs.current.set(block.id, el)
              }}
            >
              <SortableBlock
                block={block}
                isActive={activeBlockId === block.id}
                isOnlyBlock={blocks.length === 1}
                onFocus={() => handleBlockFocus(block.id)}
                onDelete={() => handleDeleteBlock(block.id)}
                onContentChange={(html) => updateBlock(block.id, { content: html })}
                onSelectionChange={setHasSelection}
                editorRef={{
                  current: editorRefs.current.get(block.id) || null
                } as React.RefObject<RichTextEditorHandle>}
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={handleAddBlock}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Ajouter un bloc</span>
      </button>

      {isActive && activeBlock && toolbarPosition && (
        <div ref={toolbarRef}>
          <FloatingToolbar
            position={toolbarPosition}
            font={activeBlock.font}
            fontSize={activeBlock.fontSize}
            color={activeBlock.color}
            bold={false}
            italic={false}
            underline={false}
            cadreEnabled={activeBlock.cadre.enabled || activeBlock.cadre.border?.enabled || false}
            onFontChange={handleFontChange}
            onSizeChange={handleSizeChange}
            onBoldToggle={handleBoldToggle}
            onItalicToggle={handleItalicToggle}
            onUnderlineToggle={handleUnderlineToggle}
            onColorClick={handleColorClick}
            onAlignClick={handleAlignClick}
            onCadreClick={handleCadreClick}
            onClose={handleClose}
          />
        </div>
      )}

      {isActive && sidePanelOpen && activeBlock && toolbarPosition && (
        <div ref={sidePanelRef}>
          <SidePanel
            type={sidePanelType}
            position={toolbarPosition}
            color={sidePanelType === 'color' ? activeBlock.color : undefined}
            textAlign={sidePanelType === 'alignment' ? activeBlock.textAlign : undefined}
            cadre={sidePanelType === 'cadre' ? activeBlock.cadre : undefined}
            projectColors={designConfig.projectColors}
            onColorChange={handleColorChange}
            onAlignChange={handleAlignChange}
            onCadreToggle={handleCadreToggle}
            onCadreChange={handleCadreChange}
            onClose={() => setSidePanelOpen(false)}
          />
        </div>
      )}
    </div>
  )
}