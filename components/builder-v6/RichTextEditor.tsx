'use client'

import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import type { Editor } from '@tiptap/react'

interface RichTextEditorProps {
  content: string
  font: string
  fontSize: number
  color: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  placeholder?: string
  cadre: {
    enabled: boolean
    backgroundColor: string
    borderRadius: number
    padding: number
    border?: {
      enabled: boolean
      color: string
      width: number
    }
  }
  isActive: boolean
  onFocus: () => void
  onBlur: () => void
  onChange: (html: string) => void
  onSelectionChange?: (hasSelection: boolean) => void
}

export interface RichTextEditorHandle {
  getEditor: () => Editor | null
  toggleBold: () => void
  toggleItalic: () => void
  toggleUnderline: () => void
}

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({
  content,
  font,
  fontSize,
  color,
  textAlign,
  placeholder = 'Cliquez pour ajouter du texte',
  cadre,
  isActive,
  onFocus,
  onBlur,
  onChange,
  onSelectionChange
}, ref) => {
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        dropcursor: false
      }),
      Underline,
      TextAlign.configure({
        types: ['paragraph'],
        alignments: ['left', 'center', 'right', 'justify']
      })
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: content || '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none w-full',
        style: 'direction: ltr; min-height: 44px; cursor: text;'
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    onFocus: () => {
      onFocus()
    },
    onBlur: () => {
      onBlur()
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionChange) {
        const { from, to } = editor.state.selection
        onSelectionChange(from !== to)
      }
    }
  }, [])

  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
    toggleBold: () => editor?.chain().focus().toggleBold().run(),
    toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
    toggleUnderline: () => editor?.chain().focus().toggleUnderline().run()
  }))

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.commands.setTextAlign(textAlign)
    }
  }, [textAlign, editor])

  if (!editor) {
    return null
  }

  const isEmpty = !content || content === '<p></p>' || content === ''
  
  const wrapperStyle = (cadre.enabled || cadre.border?.enabled) ? {
    backgroundColor: cadre.enabled ? cadre.backgroundColor : 'transparent',
    borderRadius: cadre.borderRadius + 'px',
    padding: cadre.padding + 'px',
    border: cadre.border?.enabled 
      ? cadre.border.width + 'px solid ' + cadre.border.color
      : 'none'
  } : undefined

  const editorStyle = {
    fontFamily: font,
    fontSize: fontSize + 'px',
    color: color,
    textAlign: isEmpty ? 'center' : textAlign,
    minHeight: '44px',
    cursor: 'text'
  }

  return (
    <div style={wrapperStyle} className="w-full">
      <div style={editorStyle} className="relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
})

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor