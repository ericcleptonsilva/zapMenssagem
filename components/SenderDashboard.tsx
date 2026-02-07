import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '../types';

interface SenderDashboardProps {
  contacts: Contact[];
  template: string;
  onUpdateStatus: (id: string, status: Contact['status']) => void;
  onReset: () => void;
  onBack: () => void;
}

export const SenderDashboard: React.FC<SenderDashboardProps> = ({ 
  contacts, 
  template, 
  onUpdateStatus, 
  onReset,
  onBack
}) => {
  const [useWebUrl, setUseWebUrl] = useState(false);
  
  // O próximo contato pendente
  const nextContact = contacts.find(c => c.status === 'pending');
  
  // Rastreia qual contato acabamos de abrir no WhatsApp
  const [justOpenedId, setJustOpenedId] = useState<string | null>(null);

  // Referência para o áudio
  const audioContextRef = useRef<AudioContext | null>(null);

  // Efeito para detectar quando o usuário VOLTA para a aba
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Se a página ficou visível (usuário voltou do WhatsApp) E tínhamos acabado de abrir um contato
      if (document.visibilityState === 'visible' && justOpenedId) {
        // Marca como enviado automaticamente para agilizar
        onUpdateStatus(justOpenedId, 'sent');
        setJustOpenedId(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [justOpenedId, onUpdateStatus]);

  const playBeep = () => {
    try {
        if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
        ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        // Ignora erro
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const prepareMessage = (contact: Contact) => {
    let msg = template;
    msg = msg.replace(/{nome}/g, contact.name);
    msg = msg.replace(/{saudacao}/g, getGreeting());
    return encodeURIComponent(msg);
  };

  const handleSendClick = (contact: Contact) => {
    playBeep(); 
    setJustOpenedId(contact.id);

    let url = '';
    if (useWebUrl) {
       url = `https://web.whatsapp.com/send?phone=${contact.phone}&text=${prepareMessage(contact)}`;
    } else {
       url = `https://wa.me/${contact.phone}?text=${prepareMessage(contact)}`;
    }
    
    window.open(url, '_blank');
  };

  const handleManualStatus = (contactId: string, status: 'sent' | 'skipped') => {
    onUpdateStatus(contactId, status);
    setJustOpenedId(null); // Limpa estado se alterou manualmente
  };

  const stats = {
    total: contacts.length,
    sent: contacts.filter(c => c.status === 'sent').length,
    pending: contacts.filter(c => c.status === 'pending').length,
    skipped: contacts.filter(c => c.status === 'skipped').length,
  };

  const progress = Math.round((stats.sent / stats.total) * 100) || 0;

  return (
    <div className="space-y-6 relative pb-24"> {/* Padding bottom extra para o botão fixo */}
      
      {/* Stats Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-emerald-500 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Progresso</p>
          <h3 className="text-2xl font-bold text-gray-800">{progress}%</h3>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div><i className="fa-solid fa-check text-emerald-500"></i> {stats.sent} enviados</div>
          <div><i className="fa-solid fa-clock text-orange-500"></i> {stats.pending} pendentes</div>
        </div>
      </div>

      {/* ÁREA DE AÇÃO PRINCIPAL (Destacada) */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 rounded-xl shadow-md text-center">
        
        <div className="flex justify-end mb-2">
             <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useWebUrl} 
                  onChange={(e) => setUseWebUrl(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-500 font-medium">
                  Usar WhatsApp Web (PC)
                </span>
             </label>
        </div>

        {nextContact ? (
            <div className="animate-fade-in">
                <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-1">Próximo Contato</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2 truncate">{nextContact.name}</div>
                <div className="text-lg text-gray-500 font-mono mb-6">{nextContact.phone}</div>
                
                <div className="grid grid-cols-4 gap-3">
                    <button
                        onClick={() => handleManualStatus(nextContact.id, 'skipped')}
                        className="col-span-1 py-4 rounded-xl border border-gray-300 text-gray-500 hover:bg-gray-100 font-medium flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                    >
                        <i className="fa-solid fa-forward"></i>
                        <span className="text-xs">Pular</span>
                    </button>

                    <button
                        onClick={() => handleSendClick(nextContact)}
                        className="col-span-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                        <i className="fa-brands fa-whatsapp text-2xl"></i>
                        ENVIAR AGORA
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    Dica: Ao voltar do WhatsApp, este contato será marcado como enviado automaticamente.
                </p>
            </div>
        ) : (
            <div className="py-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    <i className="fa-solid fa-check"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Lista Finalizada!</h2>
                <p className="text-gray-500 mt-2">Todos os contatos foram processados.</p>
                <button 
                    onClick={onReset}
                    className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                >
                    Nova Campanha
                </button>
            </div>
        )}
      </div>

      {/* Lista Completa */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-700 text-sm">Histórico da Lista</h3>
        </div>
        
        <div className="divide-y divide-gray-100 max-h-[40vh] overflow-y-auto">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`p-4 flex items-center justify-between transition-all ${
                contact.status === 'sent' 
                    ? 'bg-green-50' 
                : contact.status === 'skipped' 
                    ? 'bg-gray-100' 
                : contact.id === nextContact?.id // Highlight next one
                    ? 'bg-indigo-50 border-l-4 border-indigo-500 pl-3'
                    : 'bg-white'
              }`}
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className={`font-medium truncate ${
                    contact.status === 'skipped' ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}>{contact.name}</p>
                <p className="text-xs text-gray-500 font-mono">{contact.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                {contact.status === 'pending' && contact.id !== nextContact?.id && (
                   <span className="text-gray-400 text-xs">Aguardando...</span>
                )}
                {contact.id === nextContact?.id && (
                    <span className="text-indigo-600 font-bold text-xs uppercase animate-pulse">
                        Próximo
                    </span>
                )}
                {contact.status === 'sent' && (
                  <span className="text-emerald-700 font-bold text-xs flex items-center bg-emerald-100 px-2 py-1 rounded">
                    <i className="fa-solid fa-check mr-1"></i> Enviado
                  </span>
                )}
                {contact.status === 'skipped' && (
                  <span className="text-gray-500 text-xs flex items-center bg-gray-200 px-2 py-1 rounded">
                    Pulado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
         <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Voltar para edição
        </button>
      </div>
    </div>
  );
};
