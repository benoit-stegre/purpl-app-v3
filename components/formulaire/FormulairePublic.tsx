'use client';

import { useState, useEffect } from 'react';
import { QuestionRenderer } from './QuestionRenderer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Question {
  id: string;
  type: string;
  question_text: string;
  options?: string[];
  obligatoire: boolean;
  photo_autorisee: boolean;
}

interface FormulairePublicProps {
  questions: Question[];
  concertationId: string;
  designConfig: any;
  onComplete: () => void;
}

export function FormulairePublic({
  questions,
  concertationId,
  designConfig,
  onComplete,
}: FormulairePublicProps) {
  const supabase = createClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reponses, setReponses] = useState<Record<string, any>>({});
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentReponse = reponses[currentQuestion.id];

  const canGoNext = () => {
    if (!currentQuestion.obligatoire) return true;
    if (!currentReponse) return false;
    if (typeof currentReponse === 'string' && !currentReponse.trim()) return false;
    if (Array.isArray(currentReponse) && currentReponse.length === 0) return false;
    return true;
  };

  const handleReponseChange = (questionId: string, value: any) => {
    setReponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (canGoNext()) {
      if (isLastQuestion) {
        handleSubmit();
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from('reponses').insert({
        concertation_id: concertationId,
        session_id: sessionId,
        reponse_data: reponses,
      });

      if (error) throw error;

      onComplete();
    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('Erreur lors de la soumission du formulaire');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              Question {currentIndex + 1} sur {questions.length}
            </span>
            <div className="flex gap-1">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition ${
                    index === currentIndex
                      ? 'bg-blue-600'
                      : index < currentIndex
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <QuestionRenderer
          question={currentQuestion}
          value={currentReponse}
          onChange={(value) => handleReponseChange(currentQuestion.id, value)}
          concertationId={concertationId}
        />

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Précédent
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLastQuestion ? 'Terminer' : 'Suivant'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}