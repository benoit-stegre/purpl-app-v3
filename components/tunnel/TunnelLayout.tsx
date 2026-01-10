'use client';

import { ReactNode } from 'react';
import { TunnelHeader } from './TunnelHeader';

interface TunnelLayoutProps {
  children: ReactNode;
  currentStep: number;
  concertationId: string;
  onNext?: () => void;
  onPrevious?: () => void;
}

const steps = [
  { id: 1, name: 'Informations', path: 'informations' },
  { id: 2, name: 'Design', path: 'design' },
  { id: 3, name: 'Questions', path: 'questions' },
  { id: 4, name: 'Remerciement', path: 'remerciement' },
  { id: 5, name: 'Affiche', path: 'affiche' },
  { id: 6, name: 'Export', path: 'export' },
];

export function TunnelLayout({
  children,
  currentStep,
  concertationId,
  onNext,
  onPrevious,
}: TunnelLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TunnelHeader
        steps={steps}
        currentStep={currentStep}
        concertationId={concertationId}
        onNext={onNext}
        onPrevious={onPrevious}
      />
      <main className="pt-20">{children}</main>
    </div>
  );
}