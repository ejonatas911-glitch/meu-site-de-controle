import React from 'react';
import { Person } from '../types/index.ts';
import { Plus, Users, Download, WalletCards, ShieldCheck, Cloud, CloudCheck, LogIn, LogOut, FolderGit2, Smartphone } from 'lucide-react';
import { useAuth } from '../firebase/AuthContext.tsx';

interface HeaderProps {
  people: Person[];
  selectedPersonId: string;
  onSelectPerson: (personId: string) => void;
  onOpenNewExpense: () => void;
  onOpenPersonManager: () => void;
  onOpenBackup: () => void;
  onOpenGitHub: () => void;
  onOpenInstallPWA: () => void;
  currentAppUser?: string;
  onLogoutApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  people,
  selectedPersonId,
  onSelectPerson,
  onOpenNewExpense,
  onOpenPersonManager,
  onOpenBackup,
  onOpenGitHub,
  onOpenInstallPWA,
  currentAppUser,
  onLogoutApp,
}) => {
  const { currentUser, signInWithGoogle, logout, isFirestoreConnected } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs w-full">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Top Brand & Title Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md ring-1 ring-amber-400/50 bg-[#0B192C] flex items-center justify-center">
                <img
                  src="/icons/icon-192x192.png"
                  alt="Logo Meu Controle de Parcelas"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                    Meu Controle de Parcelas
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 font-semibold tracking-wide">
                    Sistema de Jonatas Eduardo
                  </span>
                  <span className="text-slate-300">·</span>
                  {currentUser ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CloudCheck className="w-3.5 h-3.5" />
                      Nuvem Firestore Ativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Cloud className="w-3.5 h-3.5" />
                      Salvo no Aparelho
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Fast Action: + Nova Despesa */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenNewExpense}
                className="h-10 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                aria-label="Cadastrar Nova Despesa"
              >
                <Plus className="w-4 h-4" />
                <span>Nova</span>
              </button>
            </div>
          </div>

          {/* Controls: Person Filter + Cloud Auth + Action Buttons */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-t-0">
            
            {/* Person Switcher Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-100 rounded-lg p-1 text-xs">
              <div className="flex items-center gap-1.5 pl-2 text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-medium hidden sm:inline">Pessoa:</span>
              </div>
              <select
                value={selectedPersonId}
                onChange={(e) => onSelectPerson(e.target.value)}
                className="bg-transparent text-slate-900 font-semibold text-xs py-1.5 px-2 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                title="Filtrar por pessoa"
              >
                <option value="all">Todas as Pessoas ({people.length})</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isDefault ? '(Principal)' : ''}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onOpenPersonManager}
                title="Gerenciar ou adicionar pessoas"
                className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors text-xs font-medium"
              >
                Gerenciar
              </button>
            </div>

            {/* Firebase Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg px-2.5 py-1 text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuário'}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <span className="font-semibold text-emerald-950 truncate max-w-[90px] sm:max-w-[130px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  title="Desconectar do Google"
                  className="p-1 text-emerald-700 hover:text-rose-700 hover:bg-emerald-100/60 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                title="Conectar com o Google para salvar no Firebase Firestore"
                className="h-9 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Salvar na Nuvem (Google)</span>
              </button>
            )}

            {/* System App User Badge & Logout */}
            {currentAppUser && (
              <div className="flex items-center gap-1.5 bg-[#0B192C] text-white border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-mono font-bold text-amber-300 truncate max-w-[100px] sm:max-w-none">
                  {currentAppUser}
                </span>
                {onLogoutApp && (
                  <button
                    type="button"
                    onClick={onLogoutApp}
                    title="Sair do sistema (Bloquear tela)"
                    className="p-1 ml-0.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Actions: Instalar PWA, GitHub, Backup and Desktop "+ Nova Despesa" */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onOpenInstallPWA}
                title="Instalar no Android (Aplicativo PWA)"
                className="h-9 px-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:from-amber-600 active:to-amber-700 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden">Instalar</span>
              </button>

              <button
                type="button"
                onClick={onOpenGitHub}
                title="Salvar projeto público no GitHub"
                className="h-9 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">GitHub</span>
              </button>

              <button
                type="button"
                onClick={onOpenBackup}
                title="Backup e restauração dos dados"
                className="h-9 px-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Backup</span>
              </button>

              <button
                type="button"
                onClick={onOpenNewExpense}
                className="hidden md:flex h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Despesa / Empréstimo</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
