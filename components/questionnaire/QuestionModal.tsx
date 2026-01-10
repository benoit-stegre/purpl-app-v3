'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Question {
  id?: string;
  type: string;
  question_text: string;
  options?: string[];
  obligatoire: boolean;
  photo_autorisee: boolean;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  question?: Question;
}

export function QuestionModal({ isOpen, onClose, onSave, question }: QuestionModalProps) {
  const [type, setType] = useState('texte_court');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['']);
  const [obligatoire, setObligatoire] = useState(false);
  const [photoAutorisee, setPhotoAutorisee] = useState(false);

  useEffect(() => {
    if (question) {
      setType(question.type);
      setQuestionText(question.question_text);
      setOptions(question.options || ['']);
      setObligatoire(question.obligatoire);
      setPhotoAutorisee(question.photo_autorisee);
    } else {
      setType('texte_court');
      setQuestionText('');
      setOptions(['']);
      setObligatoire(false);
      setPhotoAutorisee(false);
    }
  }, [question, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const newQuestion: Question = {
      type,
      question_text: questionText,
      obligatoire,
      photo_autorisee: photoAutorisee,
    };

    if (type === 'choix_unique' || type === 'choix_multiple') {
      newQuestion.options = options.filter((o) => o.trim() !== '');
    }

    if (question?.id) {
      newQuestion.id = question.id;
    }

    onSave(newQuestion);
    onClose();
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {question ? 'Modifier la question' : 'Ajouter une question'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Type de question</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="texte_court">Texte court</option>
              <option value="texte_long">Texte long</option>
              <option value="choix_unique">Choix unique</option>
              <option value="choix_multiple">Choix multiple</option>
              <option value="echelle">Échelle</option>
              <option value="photo">Photo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Posez votre question..."
            />
          </div>

          {(type === 'choix_unique' || type === 'choix_multiple') && (
            <div>
              <label className="block text-sm font-medium mb-2">Options de réponse</label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 1 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addOption}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Ajouter une option
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={obligatoire}
                onChange={(e) => setObligatoire(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm">Réponse obligatoire</span>
            </label>

            {type === 'photo' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={photoAutorisee}
                  onChange={(e) => setPhotoAutorisee(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">Autoriser l&apos;upload photo</span>
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!questionText.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {question ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}