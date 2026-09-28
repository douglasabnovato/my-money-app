# Deploy · My Money

Plano de ação para publicar a API e o front em hospedagem gratuita.

## 1. Desafio

Colocar no ar, sem custo, o controle de ciclos de pagamento (API Express 5 + MongoDB e front React/Vite com Redux), com login por JWT, garantindo que os tokens emitidos pela versão antiga (que carregavam o hash da senha) deixem de valer e que os dados de cada usuário continuem isolados.

## 2. Conteúdo

### Decisão de hospedagem

| Opção | Resultado |
|---|---|
| **Render: API (web service Free) + front (site estático) + MongoDB Atlas M0 (escolhida)** | Blueprint pronto em `render.yaml`; o front é estático e a API precisa de um processo Node, que o GitHub Pages não roda |
| Front no GitHub Pages + API no Render | Funciona, mas espalha o projeto em dois painéis e exige outra variável de build no GitHub; o Render já publica o estático de graça no mesmo Blueprint |
| Banco no disco do Render | O disco do plano gratuito é apagado a cada reinício: os ciclos sumiriam |
| VPS | Fora da regra do portfólio (só hospedagem gratuita) |

### Banco: um cluster M0 para todos os apps

Recomendação para o lote (my-money-app, aircnc e instagram-feed): **um único cluster M0**, com **um usuário e um banco por app**.

| App | Usuário do Atlas | Banco (na URI) | Permissão |
|---|---|---|---|
| my-money-app | `mymoney-app` | `mymoney` | `readWrite` só em `mymoney` |
| aircnc | `aircnc-app` | `aircnc` | `readWrite` só em `aircnc` |
| instagram-feed | `instarocket-app` | `instarocket` | `readWrite` só em `instarocket` |

- Assim, uma senha vazada afeta só um app, e cada um pode ser trocado sem mexer nos outros.
- **Network Access**: `0.0.0.0/0`. O Render Free não tem IP fixo; a proteção fica na senha forte de cada usuário.
- A URI leva o nome do banco antes do `?`: `mongodb+srv://mymoney-app:SENHA@SEU-CLUSTER.xxxxx.mongodb.net/mymoney?retryWrites=true&w=majority`
- Use senha só com letras e números (o botão **Autogenerate Secure Password** do Atlas serve). Caracteres como `@`, `:` e `/` quebram a URI se não forem codificados.

### O que foi ajustado para produção

| Mudança | Arquivo | Por quê |
|---|---|---|
| `NODE_VERSION` 20 → `"22"` nos dois serviços | `render.yaml` | O Node 20 saiu de suporte em abril de 2026; o Vite 8 do front também pede Node recente no build |
| `autoDeployTrigger: commit` nos dois serviços | `render.yaml` | Cada `git push` na `main` publica sozinho |
| `CORS_ORIGINS` fixado em `https://my-money-web.onrender.com` | `render.yaml` | Menos um valor para digitar; a API só aceita chamadas do front publicado |
| `VITE_API_BASE` fixado em `https://my-money-api.onrender.com` | `render.yaml` | O front já nasce apontando para a API |
| `NODE_ENV=production` na API | `render.yaml` | Modo de produção do Express |
| `AUTH_SECRET` com `generateValue: true` (já existia) | `render.yaml` | O Render gera um segredo novo e aleatório: todos os tokens antigos deixam de valer |
| CI no Node 22 | `ci/github-actions-ci.yml` | Mesma versão do Render |
| Seção "Em produção" | `Readme.md` | URL e link para este guia |

Não foi preciso regra de rewrite no site estático: o front usa `HashRouter` (endereços como `/#/billingCycles`), então toda navegação cai no `index.html`.

### Limitações conhecidas do plano gratuito

- A API dorme após 15 min sem acesso e leva cerca de 1 min para acordar. O primeiro login do dia pode mostrar erro de rede: espere e tente de novo.
- As 750 horas gratuitas por mês são da conta inteira do Render, somando todos os serviços web (o site estático não consome essas horas).
- Atlas M0: 512 MB de armazenamento, compartilhados entre os bancos do cluster.

### Segurança e LGPD

- Senha com bcrypt, token com dados mínimos, limite de tentativas no login e cadastro, `helmet` e CORS restrito.
- Os dados guardados são nome, e-mail e valores financeiros informados pelo usuário. Por ser um portfólio, oriente quem testar a usar dados fictícios.
- Nunca versione `backend/.env`. O `.gitignore` do backend já o exclui.

## 3. Solução (passo a passo)

### Etapa 0 · Segredos e dados antigos

1. **Segredo novo**: não reaproveite nenhum segredo antigo. No Render, o `AUTH_SECRET` é gerado sozinho pelo Blueprint (`generateValue`). Para rodar localmente, gere outro:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. O antigo `backend/src/.env.file` sai do repositório na Etapa 1; se ele tiver algum segredo usado em outro lugar, troque lá também.
3. **Dados antigos** (só se você for usar um banco que já tem ciclos da versão antiga): depois de criar a sua conta no app publicado, rode no seu computador, com `backend/.env` apontando para esse banco:
   `cd backend && npm run claim-orphans -- seu@email.com`
   Em banco novo e vazio, pule este passo.

### Etapa 1 · Atlas e validação local (Git Bash)

1. No **MongoDB Atlas**, use (ou crie) o cluster **M0** do lote. Em **Database Access → Add New Database User**: usuário `mymoney-app`, senha gerada, **Specific Privileges** → `readWrite` no banco `mymoney`.
2. Em **Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`), se ainda não existir.
3. Em **Database → Connect → Drivers**, copie a URI e acrescente `/mymoney` antes do `?`.
4. `cd /c/ambiente-projeto/ser-mvp/my-money-app`
5. Remover os arquivos substituídos no ciclo MVP:
   ```bash
   git rm backend/src/loader.js backend/src/.env.file
   git rm -r backend/src/config backend/src/api
   git rm frontend/src/index.js frontend/src/registerServiceWorker.js frontend/src/common/template/jquery.js frontend/public/index.html
   git rm -r frontend/src/Dashboard2
   ```
6. `cd backend && cp .env.example .env` e preencher `MONGODB_URI` (a URI do passo 3) e `AUTH_SECRET` (o valor gerado na Etapa 0).
7. `npm ci && npm test` (esperado: 9 testes passando).
8. `npm run dev` e abrir `http://localhost:3003/health` (esperado: `{"status":"ok"}`). Encerrar com Ctrl+C.
9. `cd ../frontend && npm ci && npm test && npm run build` (esperado: 4 testes passando e a pasta `dist/` criada).

### Etapa 2 · Subir para o GitHub (branch `main`)

1. `cd /c/ambiente-projeto/ser-mvp/my-money-app`
2. Ativar o CI: `mkdir -p .github/workflows && mv ci/github-actions-ci.yml .github/workflows/ci.yml && rmdir ci`
3. `git status` (não podem aparecer `.env`, `node_modules/` nem `dist/`)
4. `git add -A`
5. `git commit -m "feat(deploy): Node 22, URLs do Render fixadas no blueprint, CI ativo e guia de deploy"`
6. `git push origin main`
7. No GitHub, aba **Actions**: os jobs `backend` e `frontend` precisam ficar verdes.

### Etapa 3 · Criar os serviços no Render

1. Entrar em **render.com** com a conta do GitHub e autorizar o repositório `my-money-app`.
2. **New → Blueprint** e escolher `douglasabnovato/my-money-app`, branch `main`.
3. O Render lista `my-money-api` (Free) e `my-money-web` (Static). Ele pede um único valor: **`MONGODB_URI`** → colar a URI da Etapa 1.
4. **Apply**. Acompanhar os **Logs** da API até aparecer `My Money API na porta 10000` (3 a 5 min).
5. Se o Render avisar que um nome já existe e usar outro endereço, corrija `CORS_ORIGINS` (na API) e `VITE_API_BASE` (no web) em **Environment**, e depois **Manual Deploy** no web (a variável do Vite entra no build).

### Etapa 4 · Conferir no ar

1. `https://my-money-api.onrender.com/health` responde `{"status":"ok"}`.
2. `https://my-money-web.onrender.com` abre a tela de login (se der erro de rede, a API está acordando: aguarde 1 min).
3. Criar uma conta nova, cadastrar um ciclo com um crédito e um débito e ver o painel somar os valores em reais.
4. Abrir outra janela anônima, criar outra conta e confirmar que o ciclo da primeira não aparece.
5. Recarregar a página (F5) em `/#/billingCycles`: continua na mesma tela.
6. No DevTools (aba Network), as chamadas vão para `https://my-money-api.onrender.com` sem erro de CORS.

### Etapa 5 · Fechar

1. Se as URLs reais forem diferentes das previstas, corrigir no `Readme.md`, commit e push.
2. No GitHub, **About → Website**: colar `https://my-money-web.onrender.com`.
