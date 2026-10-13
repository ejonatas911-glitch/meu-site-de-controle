import React, { useState } from 'react';
import { exportAllDataJSON, importAllDataJSON } from '../utils/storage.ts';
import { X, Download, Upload, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  onResetToSeed: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  onResetToSeed,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const dataStr = exportAllDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-controle-parcelas-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'Arquivo de backup baixado com sucesso!' });
  };

  const handleCopy = () => {
    const dataStr = exportAllDataJSON();
    navigator.clipboard.writeText(dataStr);
    setCopied(true);
    setStatusMessage({ text: 'Backup copiado para a área de transferência!' });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleImportText = () => {
    if (!importText.trim()) {
      setStatusMessage({ text: 'Cole o texto do backup antes de restaurar.', error: true });
      return;
    }
    const result = importAllDataJSON(importText);
    if (result.success) {
      setStatusMessage({ text: result.message });
      setImportText('');
      onDataRestored();
    } else {
      setStatusMessage({ text: result.message, error: true });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importAllDataJSON(content);
      if (result.success) {
        setStatusMessage({ text: result.message });
        onDataRestored();
      } else {
        setStatusMessage({ text: result.message, error: true });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Segurança & Backup dos Dados
              </h3>
              <p className="text-xs text-slate-500">
                Seus dados ficam salvos automaticamente no seu aparelho
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                statusMessage.error
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Export Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              1. Exportar Backup
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Baixe um arquivo de segurança para guardar no seu Google Drive, WhatsApp ou trocar de celular sem perder nada.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Arquivo (.json)</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. Restaurar Backup
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Envie o arquivo .json ou cole o conteúdo do backup abaixo:
            </p>
            <div className="space-y-3">
              <label className="block">
                <span className="sr-only">Escolher arquivo de backup</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </label>

              <div className="pt-2">
                <textarea
                  rows={2}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Ou cole o código JSON aqui..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleImportText}
                  className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restaurar do Texto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Seed Reset */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Quer recarregar o exemplo do empréstimo de R$ 500?</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja recarregar o exemplo demonstrativo de Jonatas Eduardo?')) {
                  onResetToSeed();
                  setStatusMessage({ text: 'Exemplo demonstrativo recarregado com sucesso!' });
                }
              }}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Recarregar Exemplo</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
