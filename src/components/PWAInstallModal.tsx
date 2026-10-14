import React from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Sparkles,
  WifiOff,
  ShieldCheck,
  Zap,
  MoreVertical,
  ExternalLink,
  Share2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    isInstalled,
    isIOS,
    isAndroid,
    installApp,
    hasNativePrompt
  } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const outcome = await installApp();
    if (outcome === 'accepted') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-100 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Banner */}
        <div className="relative bg-gradient-to-br from-[#0B192C] via-[#10243E] to-[#1E3E62] text-white p-6 pb-7 text-center overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* App Logo Display */}
          <div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden shadow-xl ring-2 ring-amber-400/50 bg-[#0B192C] flex items-center justify-center mb-3.5 relative group">
            <img
              src="/icons/icon-192x192.png"
              alt="Logo Meu Controle de Parcelas"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform"
              onError={(e) => {
                // Fallback to internal svg if png loading is delayed
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
            <Sparkles className="w-3 h-3" /> PWA Oficial Android
          </span>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            Meu Controle de Parcelas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs mx-auto">
            Sistema de Jonatas Eduardo instalado direto no seu celular Android.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-emerald-900 text-base">
                Aplicativo Instalado com Sucesso!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Você já está utilizando o aplicativo na versão nativa standalone. Seus dados estão sincronizados com o Firebase Firestore.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2.5 text-left">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Acesso Rápido
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block">
                      Ícone na tela inicial sem precisar abrir o navegador
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Modo Offline
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block">
                      Abre instantâneo mesmo se a internet cair
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Tela Cheia 100%
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block">
                      Sem barra de URL do navegador, como app da Play Store
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Nuvem Firebase
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block">
                      Segurança oficial e autenticação Google
                    </span>
                  </div>
                </div>
              </div>

              {/* Install Trigger / Guide */}
              {hasNativePrompt ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                  >
                    <Download className="w-5 h-5" />
                    <span>Instalar Aplicativo no Android</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Toque acima para baixar o app e fixar na sua gaveta de aplicativos.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    {isIOS ? 'Como Instalar no iPhone (Safari)' : 'Como Instalar no Android (Google Chrome)'}
                  </div>

                  {isIOS ? (
                    <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                      <li>
                        No Safari, toque no ícone de <strong>Compartilhar</strong> (quadrado com seta pra cima <Share2 className="w-3.5 h-3.5 inline text-blue-600" />).
                      </li>
                      <li>
                        Role as opções e toque em <strong>"Adicionar à Tela de Início"</strong>.
                      </li>
                      <li>
                        Confirme no botão <strong>"Adicionar"</strong> no canto superior direito.
                      </li>
                    </ol>
                  ) : (
                    <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                      <li>
                        No <strong>Google Chrome</strong> do celular, toque nos <strong>3 pontinhos</strong> (<MoreVertical className="w-3.5 h-3.5 inline text-slate-700" />) no canto superior direito.
                      </li>
                      <li>
                        Toque na opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                      </li>
                      <li>
                        Confirme clicando em <strong>"Instalar"</strong>. Pronto! O ícone de carteira dourada aparecerá junto aos seus apps!
                      </li>
                    </ol>
                  )}
                </div>
              )}
            </>
          )}

          {/* Quick Info Box */}
          <div className="bg-slate-100/70 rounded-xl p-3 text-[11px] text-slate-500 text-center">
            Nome do App: <strong className="text-slate-700">Meu Controle de Parcelas</strong> · Nome Curto: <strong className="text-slate-700">Parcelas</strong>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>® App feito por Jonatas Eduardo • Marca Registrada</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
