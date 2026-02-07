import React, { useState } from 'react';
import { generateMarketingMessage } from '../services/geminiService';

interface MessageComposerProps {
  initialMessage: string;
  onMessageConfirmed: (message: string) => void;
  onBack: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ initialMessage, onMessageConfirmed, onBack }) => {
  const [message, setMessage] = useState(initialMessage);
  
  // AI State
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Amigável');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const handleGenerateAI = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const generated = await generateMarketingMessage(topic, tone, true);
      setMessage(generated);
      setShowAiPanel(false); // Close panel on success
    } catch (e) {
      alert("Erro ao gerar mensagem.");
    } finally {
      setIsGenerating(false);
    }
  };

  const insertVariable = (variable: string) => {
    setMessage(prev => prev + ` ${variable}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Escrever Mensagem</h2>

      {/* AI Assistant Toggle */}
      <button
        onClick={() => setShowAiPanel(!showAiPanel)}
        className="w-full mb-4 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-sm hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-wand-magic-sparkles"></i>
        {showAiPanel ? 'Fechar Assistente IA' : 'Criar com Inteligência Artificial'}
      </button>

      {/* AI Panel */}
      {showAiPanel && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 animate-fade-in-down">
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium text-indigo-900 mb-1">Sobre o que é a mensagem?</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Promoção de pizza 2x1, Lembrete de consulta..."
                className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-900 mb-1">Tom de voz</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Amigável">Amigável</option>
                <option value="Profissional">Profissional</option>
                <option value="Urgente">Urgente/Escassez</option>
                <option value="Engraçado">Engraçado</option>
              </select>
            </div>
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating || !topic.trim()}
              className="mt-2 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isGenerating ? (
                <><i className="fa-solid fa-circle-notch fa-spin"></i> Gerando...</>
              ) : (
                <><i className="fa-solid fa-bolt"></i> Gerar Texto</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Manual Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texto da Mensagem
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
          placeholder="Olá! Gostaria de falar sobre..."
        ></textarea>
        
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
          <button 
            onClick={() => insertVariable('{nome}')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 whitespace-nowrap"
          >
            + {`{nome}`}
          </button>
           <button 
            onClick={() => insertVariable('{saudacao}')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 whitespace-nowrap"
          >
            + {`{saudacao}`}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Use variáveis como {`{nome}`} para personalizar para cada contato.
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={() => onMessageConfirmed(message)}
          disabled={!message.trim()}
          className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo: Enviar
        </button>
      </div>
    </div>
  );
};
