import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  KeyRound,
  AlertCircle,
  HelpCircle,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
  onOpenInstallPWA?: () => void;
}

export const OFFICIAL_USER = 'Jonfx123@';
export const OFFICIAL_PASS = 'Jonfx123';
export const AUTH_STORAGE_KEY = 'mcp_authenticated_user_v1';
export const AUTH_REMEMBER_KEY = 'mcp_auth_remember_v1';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenInstallPWA }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // Validação flexível e segura das credenciais oficiais
    const isUserValid =
      cleanUser === OFFICIAL_USER ||
      cleanUser.toLowerCase() === OFFICIAL_USER.toLowerCase() ||
      cleanUser === 'Jonfx123' ||
      cleanUser.toLowerCase() === 'jonfx123';

    const isPassValid =
      cleanPass === OFFICIAL_PASS ||
      cleanPass.toLowerCase() === OFFICIAL_PASS.toLowerCase();

    setTimeout(() => {
      if (isUserValid && isPassValid) {
        if (rememberMe) {
          localStorage.setItem(AUTH_STORAGE_KEY, OFFICIAL_USER);
          localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, OFFICIAL_USER);
          localStorage.removeItem(AUTH_REMEMBER_KEY);
        }
        onLoginSuccess(OFFICIAL_USER);
      } else {
        setIsSubmitting(false);
        setErrorMessage('Usuário ou senha incorretos. Clique em "Esqueci meus dados" abaixo se precisar.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#070F1E] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="bg-[#0D1B2A]/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl ring-2 ring-amber-400/60 bg-[#0B192C] flex items-center justify-center">
                <img
                  src="/icons/icon-192x192.png"
                  alt="Meu Controle de Parcelas Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-[#0D1B2A]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Meu Controle de Parcelas <span className="text-amber-400 font-extrabold">®</span>
            </h1>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>App feito por Jonatas Eduardo ®</span>
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember device checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900 cursor-pointer"
                />
                <span>Manter conectado neste dispositivo</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick recovery link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-xs text-slate-400 hover:text-amber-300 font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Esqueceu seus dados ou não consegue entrar?</span>
              </button>
            </div>
          </form>
        </div>

        {/* PWA Install Button from Login Screen */}
        {onOpenInstallPWA && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onOpenInstallPWA}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700/60 shadow-sm cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Instalar Aplicativo no Celular (Android)</span>
            </button>
          </div>
        )}

        {/* Footer info & Trademark */}
        <div className="mt-6 text-center space-y-1 text-[11px] text-slate-500">
          <p className="font-semibold text-slate-400">
            ® App feito por Jonatas Eduardo • Marca Registrada
          </p>
          <p className="text-slate-500 text-[10px]">
            Meu Controle de Parcelas ® • Sistema seguro com armazenamento protegido
          </p>
        </div>
      </div>

      {/* Help & Fast Access Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1B2A] border border-amber-400/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-400/20 rounded-xl text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Dados de Acesso</h3>
                <p className="text-[11px] text-slate-400">Exclusivo: Jonatas Eduardo ®</p>
              </div>
            </div>

            <div className="space-y-2.5 my-4 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Usuário Oficial:</span>
                <span className="font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {OFFICIAL_USER}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Senha Oficial:</span>
                <span className="font-mono font-bold text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                  {OFFICIAL_PASS}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Clique no botão abaixo para preencher automaticamente e entrar direto no seu aplicativo sem precisar digitar.
            </p>

            <button
              type="button"
              onClick={() => {
                setUsername(OFFICIAL_USER);
                setPassword(OFFICIAL_PASS);
                localStorage.setItem(AUTH_STORAGE_KEY, OFFICIAL_USER);
                localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
                setShowHelpModal(false);
                onLoginSuccess(OFFICIAL_USER);
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Entrar no Aplicativo Agora</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
