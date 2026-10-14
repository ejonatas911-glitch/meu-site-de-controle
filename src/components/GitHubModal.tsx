import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Terminal,
  Key,
  FolderGit2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { downloadProjectZip, publishToGitHub } from '../utils/githubExport.ts';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'zip' | 'terminal'>('direct');
  const [githubToken, setGithubToken] = useState('');
  const [repoName, setRepoName] = useState('meu-controle-de-parcelas');
  const [description, setDescription] = useState(
    'Meu Controle de Parcelas - Sistema de Jonatas Eduardo para gestão de despesas e parcelas'
  );
  const [githubUser, setGithubUser] = useState('jonataseduardo');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    url?: string;
  } | null>(null);

  if (!isOpen) return null;

  const terminalCommands = `# 1. Acesse a pasta do projeto no seu computador
cd meu-controle-de-parcelas

# 2. Inicialize o repositório git e ramificação principal
git init
git branch -M main

# 3. Adicione todos os arquivos e faça o commit
git add .
git commit -m "Meu Controle de Parcelas - Sistema de Jonatas Eduardo"

# 4. Vincule com o seu repositório PÚBLICO do GitHub
git remote add origin https://github.com/${githubUser.trim() || 'SEU_USUARIO'}/${repoName.trim() || 'meu-controle-de-parcelas'}.git

# 5. Envie para o GitHub (Push)
git push -u origin main`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(terminalCommands);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadProjectZip();
    } catch (err: any) {
      alert('Erro ao gerar arquivo zip: ' + err.message);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handlePublishDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!githubToken.trim()) {
      setResult({
        success: false,
        message: 'Por favor, insira o seu Token de Acesso Pessoal (Token do GitHub).',
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await publishToGitHub({
        token: githubToken,
        repoName,
        description,
        isPrivate: false, // 100% PÚBLICO como pedido pelo usuário
        includeUserData: true,
      });

      setResult({
        success: res.success,
        message: res.message,
        url: res.htmlUrl || res.repoUrl,
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Erro ao publicar no GitHub.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <FolderGit2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Salvar Público no GitHub</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Globe className="w-3 h-3" /> Público
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Meu Controle de Parcelas · Sistema de Jonatas Eduardo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('direct');
              setResult(null);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'direct'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Publicar Direto (Automático)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('zip');
              setResult(null);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'zip'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Baixar Projeto Completo (.ZIP)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('terminal');
              setResult(null);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-purple-600" />
            <span>Comandos do Terminal Git</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: DIRECT GITHUB API PUBLISH */}
          {activeTab === 'direct' && (
            <form onSubmit={handlePublishDirect} className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Globe className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <span className="font-bold text-emerald-900 block mb-0.5">
                    Repositório 100% Público no GitHub
                  </span>
                  O código do aplicativo e os componentes serão publicados diretamente na sua conta
                  do GitHub com visibilidade pública, acessível a qualquer pessoa pelo link do
                  repositório.
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      Token de Acesso do GitHub (Personal Access Token): *
                    </label>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=public_repo&description=Meu+Controle+de+Parcelas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center gap-0.5 underline"
                    >
                      Gerar token no GitHub
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Basta um token clássico com a permissão <strong>public_repo</strong> marcada. O
                    token não é salvo em nenhum servidor, é usado apenas diretamente no seu
                    navegador.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nome do Repositório:
                    </label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="meu-controle-de-parcelas"
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Visibilidade:
                    </label>
                    <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PÚBLICO (Visível a todos)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Descrição do Repositório:
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Status or Result Message */}
              {result && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                    result.success
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{result.message}</p>
                    {result.url && (
                      <div className="mt-2">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors"
                        >
                          <span>Abrir Repositório Público no GitHub</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Criando e enviando arquivos para o GitHub...</span>
                  </>
                ) : (
                  <>
                    <FolderGit2 className="w-4 h-4" />
                    <span>Salvar Repositório Público no GitHub</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: DOWNLOAD ZIP */}
          {activeTab === 'zip' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 space-y-1">
                  <span className="font-bold text-blue-900 block">
                    Baixar Projeto Completo em Arquivo .ZIP
                  </span>
                  <p>
                    Baixe todos os arquivos prontos do código-fonte (React, TypeScript, Vite, Tailwind CSS,
                    configurações e README do sistema de Jonatas Eduardo).
                  </p>
                  <p className="text-blue-800 pt-1 font-medium">
                    Depois de baixar, você pode simplesmente arrastar a pasta ou arquivos para criar um
                    repositório público no GitHub através do botão <strong>"Upload files"</strong> do
                    site do GitHub!
                  </p>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <div className="text-xs text-slate-700 font-semibold flex items-center justify-between">
                  <span>Conteúdo incluído no ZIP:</span>
                  <span className="text-emerald-700 font-bold">100% Completo</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-600">
                  <div className="p-1.5 bg-white rounded border border-slate-200">src/App.tsx</div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">src/components/*</div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">src/utils/*</div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">package.json</div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">README.md</div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">index.html</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isDownloadingZip}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isDownloadingZip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compactando arquivos...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Baixar Arquivo .ZIP do Projeto Agora</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: TERMINAL GIT COMMANDS */}
          {activeTab === 'terminal' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3">
                <Terminal className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-950 space-y-1">
                  <span className="font-bold text-purple-900 block">
                    Comandos Git Prontos para Publicar
                  </span>
                  <p>
                    Se você usa Git no terminal (Git Bash, VS Code ou PowerShell), use estes comandos para
                    subir o projeto para seu repositório público no GitHub:
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Seu Nome de Usuário no GitHub (para personalizar os comandos):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    placeholder="jonataseduardo"
                    className="flex-1 text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCommands}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCommands ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Comandos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-[11px] sm:text-xs rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                  {terminalCommands}
                </pre>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>Não criou o repositório no GitHub ainda?</span>
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 underline"
                >
                  Criar Repositório Público no GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-700">Repositório Público no GitHub</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-emerald-800 font-bold hidden sm:inline">® App feito por Jonatas Eduardo</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
