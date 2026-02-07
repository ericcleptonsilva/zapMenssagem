import React, { useState } from 'react';
import { Contact, AppStep } from './types';
import { Header } from './components/Header';
import { ContactImport } from './components/ContactImport';
import { MessageComposer } from './components/MessageComposer';
import { SenderDashboard } from './components/SenderDashboard';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.IMPORT);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messageTemplate, setMessageTemplate] = useState('');

  const handleContactsImported = (importedContacts: Contact[]) => {
    setContacts(importedContacts);
    setCurrentStep(AppStep.COMPOSE);
  };

  const handleMessageConfirmed = (msg: string) => {
    setMessageTemplate(msg);
    setCurrentStep(AppStep.SEND);
  };

  const handleUpdateStatus = (id: string, status: Contact['status']) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleReset = () => {
    if (confirm('Deseja iniciar uma nova campanha? Os dados atuais serão perdidos.')) {
      setContacts([]);
      setMessageTemplate('');
      setCurrentStep(AppStep.IMPORT);
    }
  };

  const handleBack = () => {
      if (currentStep === AppStep.COMPOSE) {
          setCurrentStep(AppStep.IMPORT);
      } else if (currentStep === AppStep.SEND) {
          setCurrentStep(AppStep.COMPOSE);
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header currentStep={currentStep} />
      
      <main className="max-w-3xl mx-auto px-4 pt-6">
        {currentStep === AppStep.IMPORT && (
          <ContactImport onContactsImported={handleContactsImported} />
        )}
        
        {currentStep === AppStep.COMPOSE && (
          <MessageComposer 
            initialMessage={messageTemplate} 
            onMessageConfirmed={handleMessageConfirmed}
            onBack={handleBack}
          />
        )}
        
        {currentStep === AppStep.SEND && (
          <SenderDashboard 
            contacts={contacts}
            template={messageTemplate}
            onUpdateStatus={handleUpdateStatus}
            onReset={handleReset}
            onBack={handleBack}
          />
        )}
      </main>

      <footer className="text-center text-gray-400 text-xs py-8">
        <p>ZapMessage AI &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">Ferramenta client-side. Seus contatos não são salvos em nenhum servidor.</p>
      </footer>
    </div>
  );
};

export default App;
