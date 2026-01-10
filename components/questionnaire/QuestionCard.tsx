'use client';

import { Trash2, Edit2, GripVertical } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  question_text: string;
  obligatoire: boolean;
}

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const typeLabels: Record<string, string> = {
  texte_court: 'Texte court',
  texte_long: 'Texte long',
  choix_unique: 'Choix unique',
  choix_multiple: 'Choix multiple',
  echelle: 'Échelle',
  photo: 'Photo',
};

export function QuestionCard({ question, index, onEdit, onDelete }: QuestionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition">
      <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {typeLabels[question.type]}
          </span>
          {question.obligatoire && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
              Obligatoire
            </span>
          )}
        </div>
        <p className="text-gray-900 font-medium">{question.question_text}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}