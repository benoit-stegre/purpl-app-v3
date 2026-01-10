'use client'

import { useQuestionnaireStore } from '@/stores/questionnaireStore'

export default function QuestionPreview() {
  const { questions, selectedQuestionId } = useQuestionnaireStore()
  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId)

  if (!selectedQuestion) {
    return (
      <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <div
          style={{
            width: 375,
            height: 812,
            maxHeight: '100%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            overflow: 'auto',
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
            <p style={{ fontSize: '16px', color: '#000000' }}>
              Sélectionnez une question
            </p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              pour voir la preview
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center flex-shrink-0 overflow-hidden">
      <div
        style={{
          width: 375,
          height: 812,
          maxHeight: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          overflow: 'auto',
          padding: 24
        }}
      >
        {/* Texte de la question */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#000000',
              lineHeight: '1.5',
              marginBottom: '8px'
            }}
          >
            {selectedQuestion.question_text}
            {selectedQuestion.obligatoire && (
              <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
            )}
          </h2>
        </div>

        {/* Image de la question si présente */}
        {selectedQuestion.image_url && (
          <div style={{ marginBottom: '24px' }}>
            <img
              src={selectedQuestion.image_url}
              alt="Question"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}
            />
          </div>
        )}

        {/* Rendu selon le type */}
        {selectedQuestion.type === 'choix_unique' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedQuestion.options?.options?.map((option, index) => (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <input
                  type="radio"
                  name="preview"
                  disabled
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: '#000000', fontSize: '14px' }}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        )}

        {selectedQuestion.type === 'choix_multiple' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedQuestion.options?.options?.map((option, index) => (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <input
                  type="checkbox"
                  disabled
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: '#000000', fontSize: '14px' }}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        )}

        {selectedQuestion.type === 'texte_libre' && (
          <textarea
            placeholder="Votre réponse..."
            disabled
            rows={5}
            style={{
              width: '100%',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              padding: '12px',
              color: '#000000',
              backgroundColor: '#F9FAFB',
              fontSize: '14px',
              resize: 'none'
            }}
          />
        )}

        {selectedQuestion.type === 'echelle' && (
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}
            >
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                {selectedQuestion.options?.label_min || 'Min'}
              </span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                {selectedQuestion.options?.label_max || 'Max'}
              </span>
            </div>
            <input
              type="range"
              min={selectedQuestion.options?.min || 1}
              max={selectedQuestion.options?.max || 10}
              disabled
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
                {selectedQuestion.options?.min || 1}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
                {selectedQuestion.options?.max || 10}
              </span>
            </div>
          </div>
        )}

        {/* Photo si autorisée */}
        {selectedQuestion.photo_autorisee && (
          <button
            disabled
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '12px',
              border: '2px dashed #D1D5DB',
              borderRadius: '8px',
              backgroundColor: '#F9FAFB',
              color: '#6B7280',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'not-allowed'
            }}
          >
            📷 Ajouter une photo (optionnel)
          </button>
        )}

        {/* Bouton suivant */}
        <button
          disabled
          style={{
            width: '100%',
            marginTop: '32px',
            padding: '14px',
            backgroundColor: '#D1D5DB',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            cursor: 'not-allowed'
          }}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}