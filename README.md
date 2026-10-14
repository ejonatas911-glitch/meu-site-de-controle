# Meu Controle de Parcelas 💰
### Sistema de Jonatas Eduardo

Um aplicativo web moderno, responsivo e em tela cheia (100% barra cheia) para controle pessoal e familiar de despesas, empréstimos e parcelas pagas e a pagar.

---

## 🚀 Funcionalidades Principais

1. **Cadastro Transparente de Despesas & Empréstimos**
   - Nome/descrição da despesa ou empréstimo.
   - Valor original, valor por parcela e quantidade total de parcelas (ex.: 24x de R$ 25,00 = R$ 600,00).
   - Data de início e frequência de pagamento (**Diária**, **Semanal** ou **Mensal**).
   - **Sem juros embutidos ou taxas escondidas**: cálculos estritamente fiéis aos valores informados.

2. **Cotas e Parcelas Sequenciais (1 até 24)**
   - Grade numerada em ordem estrita de **1 a 24** com valores individuais e datas de vencimento.
   - Seleção rápida de parcelas já quitadas diretamente no formulário de cadastro (ex.: marcar de 1 até 14 em 1 toque).
   - Toque em qualquer parcela para marcar como paga ou desmarcar se marcou por engano.
   - Atualização instantânea de parcelas pagas, parcelas restantes, total pago e saldo a pagar.

3. **Múltiplas Pessoas / Titulares**
   - Suporte a gerenciar despesas de várias pessoas (Jonatas Eduardo como principal, amigos, familiares ou clientes).
   - Filtro rápido no topo para visualizar os totais de cada pessoa ou o total geral.

4. **Nuvem com Firebase Firestore & Google Auth**
   - Sincronização em tempo real via **Google Login** e **Firebase Firestore**.
   - Regras de segurança de nível Zero-Trust (`firestore.rules`): seus dados são 100% privados e acessíveis apenas pela sua conta.
   - Modo offline com persistência em `localStorage` e ferramenta de **Backup / Restauração JSON**.

5. **Design Moderno e Responsivo**
   - Interface em **Barra Cheia 100%** adaptada para celular Android, tablet e desktop.
   - Barra de progresso geral e indicadores visuais elegantes.
   - Sem barras de rolagem visíveis desnecessárias.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** com **TypeScript**
- **Vite** para build ultrarrápido
- **Tailwind CSS v4** para estilização moderna
- **Firebase Firestore** para banco de dados NoSQL em nuvem
- **Firebase Authentication** com login Google
---

## 📱 Aplicativo PWA Instalável no Celular (Android & iOS)

O projeto está configurado como **Progressive Web App (PWA)** com suporte nativo a instalação no Android pelo Google Chrome:

- **Nome no Sistema:** Meu Controle de Parcelas
- **Nome Curto (Tela Inicial):** Parcelas
- **Ícone Oficial:** Carteira Dourada 3D com Moeda e Selo de Confirmação em fundo Azul-Marinho (#0B192C)
- **Modo:** `standalone` (abre sem barra de navegação do navegador, em tela cheia 100%)
- **Service Worker:** Cache inteligente offline preservando chamadas seguras do Firebase Firestore em tempo real.

### Como instalar no Android (Google Chrome):
1. Acesse o link da aplicação via HTTPS no celular.
2. O aplicativo exibirá o botão **"Instalar App"** no topo da tela.
3. Se preferir, toque nos **3 pontinhos (⋮)** no canto superior direito do Google Chrome e selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. Toque em **Instalar**. O ícone dourado aparecerá direto na sua tela inicial e gaveta de apps!

---

## 🌐 Publicação no GitHub (Repositório Público)

Você pode publicar este projeto no GitHub como um repositório público de duas formas:

### Forma 1: Direto pelo Aplicativo (Automático)
1. Abra o aplicativo e clique no botão **"GitHub"** no topo.
2. Na aba **"Publicar Direto (Automático)"**, informe o seu Token do GitHub com permissão `public_repo`.
3. Clique em **"Salvar Repositório Público no GitHub"**.
4. O app cria o repositório público na sua conta e envia todo o código-fonte automaticamente!
5. Se preferir, clique na aba **"Baixar Projeto Completo (.ZIP)"** e arraste os arquivos no GitHub.

### Forma 2: Pelo Terminal / Linha de Comando (Git)
```bash
# 1. Clone ou inicialize o repositório
git init
git branch -M main

# 2. Adicione os arquivos e faça o commit
git add .
git commit -m "Meu Controle de Parcelas - Sistema de Jonatas Eduardo"

# 3. Vincule ao seu repositório PÚBLICO do GitHub
git remote add origin https://github.com/SEU-USUARIO/meu-controle-de-parcelas.git

# 4. Envie as alterações
git push -u origin main
```

---

## 📦 Como Executar o Projeto Localmente

1. Clone o repositório:
```bash
git clone https://github.com/SEU-USUARIO/meu-controle-de-parcelas.git
cd meu-controle-de-parcelas
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra no navegador:
```
http://localhost:3000
```

---

## ⚙️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento na porta 3000.
- `npm run build`: Compila o aplicativo para produção na pasta `dist/`.
- `npm run preview`: Visualiza o build de produção localmente.
- `npm run lint`: Valida o TypeScript e a integridade do código.

---

## 📄 Licença e Autoria

Desenvolvido por **Jonatas Eduardo**.
Disponível para uso pessoal e customizações sob licença MIT.
