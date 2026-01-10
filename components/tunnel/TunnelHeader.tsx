'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  path: string;
}

interface TunnelHeaderProps {
  steps: Step[];
  currentStep: number;
  concertationId: string;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function TunnelHeader({
  steps,
  currentStep,
  concertationId,
  onNext,
  onPrevious,
}: TunnelHeaderProps) {
  const router = useRouter();

  const handleStepClick = (step: Step) => {
    if (step.id <= currentStep) {
      router.push(`/dashboard/concertations/creer/${step.path}?id=${concertationId}`);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Créer une concertation</h2>
          <div className="flex gap-2">
            {onPrevious && currentStep > 1 && (
              <button
                onClick={onPrevious}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(step)}
                disabled={step.id > currentStep}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  step.id === currentStep
                    ? 'bg-blue-600 text-white'
                    : step.id < currentStep
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {step.id}. {step.name}
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}