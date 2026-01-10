'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Question {
  id: string;
  type: string;
  question_text: string;
  options?: string[];
  photo_autorisee: boolean;
}

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  concertationId: string;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  concertationId,
}: QuestionRendererProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${concertationId}/reponses/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(fileName);

      onChange(data.publicUrl);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{question.question_text}</h2>

      {question.type === 'texte_court' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Votre réponse..."
        />
      )}

      {question.type === 'texte_long' && (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={6}
          placeholder="Votre réponse..."
        />
      )}

      {question.type === 'choix_unique' && question.options && (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition"
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'choix_multiple' && question.options && (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition"
            >
              <input
                type="checkbox"
                value={option}
                checked={(value || []).includes(option)}
                onChange={(e) => {
                  const newValue = value || [];
                  if (e.target.checked) {
                    onChange([...newValue, option]);
                  } else {
                    onChange(newValue.filter((v: string) => v !== option));
                  }
                }}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'echelle' && (
        <div className="flex justify-between items-center gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={`flex-1 py-4 rounded-lg border-2 font-semibold transition ${
                value === num
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}

      {question.type === 'photo' && question.photo_autorisee && (
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id={`photo-${question.id}`}
              disabled={uploading}
            />
            <label htmlFor={`photo-${question.id}`} className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {uploading ? 'Upload en cours...' : 'Cliquez pour uploader une photo'}
              </p>
            </label>
          </div>
          {value && (
            <div className="mt-4">
              <img src={value} alt="Uploaded" className="max-h-60 rounded-lg mx-auto" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}