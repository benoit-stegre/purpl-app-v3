'use client'

import { useQuestionnaireStore } from '@/stores/questionnaireStore'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableItem({
  id,
  children
}: {
  id: string
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

interface QuestionsListProps {
  setSaveStatus: (status: 'saved' | 'saving' | 'idle') => void
}

export default function QuestionsList({ setSaveStatus }: QuestionsListProps) {
  const {
    questions,
    selectedQuestionId,
    selectQuestion,
    reorderQuestions,
    addQuestion,
    concertationId
  } = useQuestionnaireStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q: any) => q.id === active.id)
      const newIndex = questions.findIndex((q: any) => q.id === over.id)

      const newOrder = arrayMove(questions, oldIndex, newIndex)
      reorderQuestions(newOrder)

      setSaveStatus('saving')
      
      await Promise.all(
        newOrder.map(async (question, index) => {
          await fetch(`/api/questions/${question.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ordre: index + 1 })
          })
        })
      )

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  async function handleAddQuestion() {
    if (!concertationId) return

    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concertation_id: concertationId,
        type: 'texte_libre',
        question_text: 'Nouvelle question',
        obligatoire: false,
        photo_autorisee: true
      })
    })

    if (response.ok) {
      const newQuestion = await response.json()
      addQuestion(newQuestion)
    }
  }

  function truncate(text: string, maxLength: number) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const typeLabels = {
    choix_unique: '○ Choix unique',
    choix_multiple: '☑ Choix multiple',
    texte_libre: '✎ Texte libre',
    echelle: '⚖ Échelle'
  }

  return (
    <div className="w-64 bg-white border-r flex flex-col flex-shrink-0 overflow-hidden">
      <div className="p-6 border-b flex-shrink-0">
        <h2 className="text-xl font-bold text-black">
          Questions ({questions.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q: any) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {questions.map((question: any, index: number) => (
                <SortableItem key={question.id} id={question.id}>
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedQuestionId === question.id
                        ? 'bg-purple-50 border-purple-600'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => selectQuestion(question.id)}
                  >
                    <div className="text-sm font-semibold text-black mb-1">
                      Q{index + 1}
                    </div>
                    <div className="text-sm text-black mb-1">
                      {truncate(question.question_text, 50)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {typeLabels[question.type as keyof typeof typeLabels]}
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="p-6 border-t flex-shrink-0">
        <button
          onClick={handleAddQuestion}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          + Ajouter une question
        </button>
      </div>
    </div>
  )
}