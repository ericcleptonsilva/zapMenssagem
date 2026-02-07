import React, { useState } from 'react';
import { Contact } from '../types';

interface ContactImportProps {
  onContactsImported: (contacts: Contact[]) => void;
}

export const ContactImport: React.FC<ContactImportProps> = ({ onContactsImported }) => {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    if (!inputText.trim()) {
      setError('Por favor, insira pelo menos um contato.');
      return;
    }

    const lines = inputText.split('\n');
    const newContacts: Contact[] = [];
    let importCount = 0;

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Simple parsing strategy: assume "Name, Phone" or just "Phone"
      // Remove everything that is not digit, plus sign or comma
      
      let name = 'Amigo(a)';
      let phone = '';

      if (cleanLine.includes(',')) {
        const parts = cleanLine.split(',');
        name = parts[0].trim() || 'Amigo(a)';
        phone = parts[1]?.trim() || '';
      } else {
        // Try to guess if the line is just a phone
        phone = cleanLine;
      }

      // Cleanup phone: keep only digits
      const cleanPhone = phone.replace(/\D/g, '');

      if (cleanPhone.length >= 8) { // Basic validation
        newContacts.push({
          id: crypto.randomUUID(),
          name,
          phone: cleanPhone,
          status: 'pending'
        });
        importCount++;
      }
    });

    if (importCount === 0) {
      setError('Nenhum número válido encontrado. Use o formato: Nome, 5511999999999');
    } else {
      setError('');
      onContactsImported(newContacts);
    }
  };

  const loadExample = () => {
    setInputText(`Maria Silva, 5511999991111
João Santos, 5511988882222
5521977773333
Ana, 5531966664444`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Importar Contatos</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Cole sua lista abaixo (formato: Nome, Telefone)
        </label>
        <textarea
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-base text-gray-900 bg-white placeholder-gray-500"
          placeholder="Exemplo:&#10;Maria, 5511999999999&#10;João, 5511888888888"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        ></textarea>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center font-medium">
          <i className="fa-solid fa-circle-exclamation mr-2 text-red-600"></i>
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={loadExample}
          className="px-4 py-3 text-emerald-700 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-bold"
        >
          Carregar Exemplo
        </button>
        <button
          onClick={handleImport}
          className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-sm flex justify-center items-center gap-2 text-base"
        >
          <i className="fa-solid fa-arrow-right"></i>
          Processar Lista
        </button>
      </div>
      
      <p className="mt-4 text-xs text-gray-600 font-medium">
        <i className="fa-solid fa-info-circle mr-1"></i>
        Certifique-se de incluir o código do país (ex: 55 para Brasil).
      </p>
    </div>
  );
};
