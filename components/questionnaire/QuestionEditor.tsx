'use client'

import { useQuestionnaireStore } from '@/stores/questionnaireStore'
import { useState, useEffect } from 'react'
import ConfirmModal from '@/components/shared/ConfirmModal'

interface QuestionEditorProps {
  setSaveStatus: (status: 'saved' | 'saving' | 'idle') => void
}

export default function QuestionEditor({ setSaveStatus }: QuestionEditorProps) {
  const { updateQuestion, deleteQuestion, questions, selectedQuestionId } =
    useQuestionnaireStore()
  
  const selectedQuestion = questions.find((q: any) => q.id === selectedQuestionId)

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  async function saveToDatabase(id: string, updates: any) {
    setSaveStatus('saving')
    await fetch(`/api/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  function handleTextChange(newText: string) {
    if (!selectedQuestion) return

    updateQuestion(selectedQuestion.id, { question_text: newText })

    if (debounceTimer) clearTimeout(debounceTimer)

    const timer = setTimeout(() => {
      saveToDatabase(selectedQuestion.id, { question_text: newText })
    }, 500)

    setDebounceTimer(timer)
  }

  function handleTypeChange(newType: any) {
    if (!selectedQuestion) return

    let newOptions = null
    if (newType === 'choix_unique' || newType === 'choix_multiple') {
      newOptions = { options: ['Option 1', 'Option 2'] }
    } else if (newType === 'echelle') {
      newOptions = {
        min: 1,
        max: 10,
        label_min: 'Pas du tout',
        label_max: 'Totalement'
      }
    }

    updateQuestion(selectedQuestion.id, { type: newType, options: newOptions })
    saveToDatabase(selectedQuestion.id, { type: newType, options: newOptions })
  }

  function handleOptionChange(index: number, newValue: string) {
    if (!selectedQuestion || !selectedQuestion.options?.options) return

    const newOptions = [...selectedQuestion.options.options]
    newOptions[index] = newValue

    const updatedOptions = { ...selectedQuestion.options, options: newOptions }
    updateQuestion(selectedQuestion.id, { options: updatedOptions })

    if (debounceTimer) clearTimeout(debounceTimer)

    const timer = setTimeout(() => {
      saveToDatabase(selectedQuestion.id, { options: updatedOptions })
    }, 500)

    setDebounceTimer(timer)
  }

  function handleAddOption() {
    if (!selectedQuestion) return

    const currentOptions = selectedQuestion.options?.options || []
    if (currentOptions.length >= 10) {
      alert('Maximum 10 options')
      return
    }

    const newOptions = {
      ...selectedQuestion.options,
      options: [...currentOptions, `Option ${currentOptions.length + 1}`]
    }

    updateQuestion(selectedQuestion.id, { options: newOptions })
    saveToDatabase(selectedQuestion.id, { options: newOptions })
  }

  function handleRemoveOption(index: number) {
    if (!selectedQuestion || !selectedQuestion.options?.options) return

    const currentOptions = selectedQuestion.options.options
    if (currentOptions.length <= 2) {
      alert('Minimum 2 options requises')
      return
    }

    const newOptions = {
      ...selectedQuestion.options,
      options: currentOptions.filter((_: any, i: number) => i !== index)
    }

    updateQuestion(selectedQuestion.id, { options: newOptions })
    saveToDatabase(selectedQuestion.id, { options: newOptions })
  }

  function handleScaleChange(field: string, value: any) {
    if (!selectedQuestion) return

    const newOptions = {
      ...selectedQuestion.options,
      [field]: value
    }

    updateQuestion(selectedQuestion.id, { options: newOptions })

    if (debounceTimer) clearTimeout(debounceTimer)

    const timer = setTimeout(() => {
      saveToDatabase(selectedQuestion.id, { options: newOptions })
    }, 500)

    setDebounceTimer(timer)
  }

  function handleToggle(field: string, value: boolean) {
    if (!selectedQuestion) return

    updateQuestion(selectedQuestion.id, { [field]: value })
    saveToDatabase(selectedQuestion.id, { [field]: value })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedQuestion || !e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]
    
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    setUploadingImage(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        updateQuestion(selectedQuestion.id, { image_url: data.url })
        await saveToDatabase(selectedQuestion.id, { image_url: data.url })
      } else {
        alert('Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleRemoveImage() {
    if (!selectedQuestion) return
    
    updateQuestion(selectedQuestion.id, { image_url: null })
    await saveToDatabase(selectedQuestion.id, { image_url: null })
  }

  async function handleDeleteQuestion() {
    if (!selectedQuestion) return

    const response = await fetch(`/api/questions/${selectedQuestion.id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      deleteQuestion(selectedQuestion.id)
    }
  }

  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [debounceTimer])

  if (!selectedQuestion) {
    return (
      <div className="w-96 bg-white border-l p-6 overflow-y-auto flex-shrink-0 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg text-black">Sélectionnez une question</p>
          <p className="text-sm mt-2">
            Cliquez sur une question à gauche pour l'éditer
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-96 bg-white border-l p-6 overflow-y-auto flex-shrink-0">
      <h2 className="text-xl font-bold text-black mb-6">Éditer la question</h2>

      <div className="space-y-6">
        {/* Texte de la question */}
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Texte de la question
          </label>
          <textarea
            value={selectedQuestion.question_text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Ex: Quelle est votre opinion sur..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Upload image */}
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Image de la question (optionnelle)
          </label>
          
          {selectedQuestion.image_url ? (
            <div className="space-y-2">
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={selectedQuestion.image_url}
                  alt="Question"
                  className="w-full h-auto"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
              <button
                onClick={handleRemoveImage}
                className="w-full bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200"
              >
                ✕ Supprimer l'image
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="question-image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="question-image-upload"
                className={`block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImage ? (
                  <span className="text-black">Upload en cours...</span>
                ) : (
                  <>
                    <span className="text-2xl">📷</span>
                    <p className="text-sm text-black mt-2">
                      Cliquez pour ajouter une image
                    </p>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Type de question */}
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Type de question
          </label>
          <select
            value={selectedQuestion.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="choix_unique">Choix unique (une seule réponse)</option>
            <option value="choix_multiple">
              Choix multiple (plusieurs réponses)
            </option>
            <option value="texte_libre">Texte libre</option>
            <option value="echelle">Échelle (1 à 10)</option>
          </select>
        </div>

        {/* Options pour choix unique/multiple */}
        {(selectedQuestion.type === 'choix_unique' ||
          selectedQuestion.type === 'choix_multiple') && (
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Options de réponse
            </label>
            <div className="space-y-2">
              {selectedQuestion.options?.options?.map((option: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddOption}
              className="mt-2 w-full bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              + Ajouter une option
            </button>
          </div>
        )}

        {/* Options pour échelle */}
        {selectedQuestion.type === 'echelle' && (
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Configuration de l'échelle
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-black mb-1">
                    Valeur min
                  </label>
                  <input
                    type="number"
                    value={selectedQuestion.options?.min || 1}
                    onChange={(e) =>
                      handleScaleChange('min', parseInt(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-black mb-1">
                    Label min
                  </label>
                  <input
                    type="text"
                    value={selectedQuestion.options?.label_min || ''}
                    onChange={(e) =>
                      handleScaleChange('label_min', e.target.value)
                    }
                    placeholder="Pas du tout"
                    className="w-full border border-gray-300 rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-black mb-1">
                    Valeur max
                  </label>
                  <input
                    type="number"
                    value={selectedQuestion.options?.max || 10}
                    onChange={(e) =>
                      handleScaleChange('max', parseInt(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-black mb-1">
                    Label max
                  </label>
                  <input
                    type="text"
                    value={selectedQuestion.options?.label_max || ''}
                    onChange={(e) =>
                      handleScaleChange('label_max', e.target.value)
                    }
                    placeholder="Totalement"
                    className="w-full border border-gray-300 rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedQuestion.obligatoire}
              onChange={(e) => handleToggle('obligatoire', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-black">Question obligatoire</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedQuestion.photo_autorisee}
              onChange={(e) =>
                handleToggle('photo_autorisee', e.target.checked)
              }
              className="w-4 h-4"
            />
            <span className="text-sm text-black">
              Autoriser l'ajout de photo par le répondant
            </span>
          </label>
        </div>

        {/* Bouton supprimer */}
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 mt-8"
        >
          Supprimer cette question
        </button>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          handleDeleteQuestion()
          setDeleteModalOpen(false)
        }}
        title="Supprimer la question"
        message="Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />
    </div>
  )
}