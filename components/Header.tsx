import React from 'react';
import { AppStep } from '../types';

interface HeaderProps {
  currentStep: AppStep;
}

export const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.IMPORT, label: 'Contatos', icon: 'fa-address-book' },
    { id: AppStep.COMPOSE, label: 'Mensagem', icon: 'fa-pen-to-square' },
    { id: AppStep.SEND, label: 'Enviar', icon: 'fa-paper-plane' },
  ];

  return (
    <header className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-brands fa-whatsapp text-2xl"></i>
            ZapMessage AI
          </h1>
        </div>
        
        <div className="flex justify-between relative">
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-emerald-800 -z-0 transform -translate-y-1/2"></div>
          
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            // Determine status: completed (index < current), active (current), or pending
            const stepIndex = Object.values(AppStep).indexOf(step.id);
            const currentIndex = Object.values(AppStep).indexOf(currentStep);
            const isCompleted = stepIndex < currentIndex;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isActive || isCompleted ? 'bg-white text-emerald-600 border-white' : 'bg-emerald-700 text-emerald-300 border-emerald-600'}
                  `}
                >
                  <i className={`fa-solid ${isCompleted ? 'fa-check' : step.icon}`}></i>
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-white' : 'text-emerald-200'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};
