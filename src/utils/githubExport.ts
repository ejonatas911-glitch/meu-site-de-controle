import JSZip from 'jszip';
import { exportAllDataJSON } from './storage.ts';

// Glob all source files as raw strings for direct zip creation and GitHub API upload
const rawSourceFiles = import.meta.glob(
  [
    '../../package.json',
    '../../README.md',
    '../../index.html',
    '../../tsconfig.json',
    '../../vite.config.ts',
    '../../metadata.json',
    '../../.gitignore',
    '../../.env.example',
    '../../firestore.rules',
    '../../public/**/*.{webmanifest,json,js}',
    '../**/*.{ts,tsx,css,json}',
  ],
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

/**
 * Normalizes file paths for the zip / GitHub repository.
 */
function normalizeFilePath(path: string): string {
  // Replace leading relative segments
  let clean = path.replace(/^\.\.\/\.\.\//, '').replace(/^\.\.\//, 'src/');
  if (clean.startsWith('src/src/')) {
    clean = clean.replace(/^src\//, '');
  }
  return clean;
}

export interface GitHubPublishOptions {
  token: string;
  repoName: string;
  description: string;
  isPrivate: boolean; // default false (public)
  includeUserData?: boolean;
}

export interface GitHubPublishResult {
  success: boolean;
  repoUrl?: string;
  message: string;
  htmlUrl?: string;
}

/**
 * Downloads the full project source code as a ZIP archive
 */
export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Add all project files
  for (const [rawPath, content] of Object.entries(rawSourceFiles)) {
    const filePath = normalizeFilePath(rawPath);
    // Skip node_modules or large binaries if any
    if (!filePath.includes('node_modules') && !filePath.includes('.git/')) {
      zip.file(filePath, content);
    }
  }

  // Also include current export of user data if present
  try {
    const currentData = exportAllDataJSON();
    zip.file('dados_exemplo_backup.json', currentData);
  } catch {
    // Ignore if localstorage unavailable
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `meu-controle-de-parcelas-jonatas-eduardo-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Publishes the application to GitHub via the GitHub REST API as a PUBLIC repository.
 */
export async function publishToGitHub(
  options: GitHubPublishOptions
): Promise<GitHubPublishResult> {
  const { token, repoName, description, isPrivate, includeUserData } = options;

  if (!token.trim()) {
    return {
      success: false,
      message: 'Token de Acesso Pessoal (Personal Access Token) do GitHub é obrigatório.',
    };
  }

  if (!repoName.trim()) {
    return {
      success: false,
      message: 'Informe o nome do repositório.',
    };
  }

  const cleanRepo = repoName.trim().replace(/\s+/g, '-').toLowerCase();

  try {
    // 1. Check authenticated user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!userRes.ok) {
      if (userRes.status === 401) {
        return {
          success: false,
          message: 'Token do GitHub inválido ou expirado. Verifique o token inserido.',
        };
      }
      return {
        success: false,
        message: `Erro ao autenticar no GitHub: ${userRes.statusText}`,
      };
    }

    const userData = await userRes.json();
    const username = userData.login;

    // 2. Create the repository (PUBLIC by default)
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cleanRepo,
        description: description.trim() || 'Meu Controle de Parcelas - Sistema de Jonatas Eduardo',
        private: isPrivate, // false for public!
        auto_init: true, // creates an initial commit so we can push files immediately
      }),
    });

    let targetRepoData: any;

    if (createRepoRes.status === 422) {
      // Repo might already exist, try to use it
      const getRepoRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!getRepoRes.ok) {
        return {
          success: false,
          message: `Repositório já existe ou nome inválido: ${cleanRepo}`,
        };
      }
      targetRepoData = await getRepoRes.json();
    } else if (!createRepoRes.ok) {
      const errData = await createRepoRes.json();
      return {
        success: false,
        message: errData.message || 'Erro ao criar repositório no GitHub.',
      };
    } else {
      targetRepoData = await createRepoRes.json();
    }

    // 3. Upload key files to the repository via GitHub Contents API
    // We upload essential root files and project structure
    const filesToUpload: Record<string, string> = {};

    for (const [rawPath, content] of Object.entries(rawSourceFiles)) {
      const filePath = normalizeFilePath(rawPath);
      if (!filePath.includes('node_modules') && !filePath.includes('.git/')) {
        filesToUpload[filePath] = content;
      }
    }

    if (includeUserData) {
      try {
        filesToUpload['dados_exemplo_backup.json'] = exportAllDataJSON();
      } catch {
        // ignore
      }
    }

    // Upload files sequentially or with concurrency control
    let uploadedCount = 0;
    const fileEntries = Object.entries(filesToUpload);

    for (const [path, content] of fileEntries) {
      try {
        // Base64 encode file content safely for UTF-8
        const utf8Bytes = new TextEncoder().encode(content);
        let binaryStr = '';
        utf8Bytes.forEach((byte) => {
          binaryStr += String.fromCharCode(byte);
        });
        const base64Content = btoa(binaryStr);

        // Check if file already exists to get SHA for update
        let sha: string | undefined;
        try {
          const checkRes = await fetch(
            `https://api.github.com/repos/${username}/${cleanRepo}/contents/${path}`,
            {
              headers: {
                Authorization: `Bearer ${token.trim()}`,
                Accept: 'application/vnd.github+json',
              },
            }
          );
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            sha = checkData.sha;
          }
        } catch {
          // file doesn't exist
        }

        const putRes = await fetch(
          `https://api.github.com/repos/${username}/${cleanRepo}/contents/${path}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token.trim()}`,
              Accept: 'application/vnd.github+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `feat: sincronizar ${path}`,
              content: base64Content,
              ...(sha ? { sha } : {}),
            }),
          }
        );

        if (putRes.ok) {
          uploadedCount++;
        }
      } catch {
        // proceed with other files
      }
    }

    return {
      success: true,
      repoUrl: targetRepoData.html_url,
      htmlUrl: targetRepoData.html_url,
      message: `Repositório Público criado com sucesso no GitHub! (${uploadedCount} arquivos enviados)`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Erro inesperado ao conectar com o GitHub.',
    };
  }
}
