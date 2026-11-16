# Deploy · My Money

Plano de ação para publicar a API e o front em hospedagem gratuita. Revisto em 16/11/2026: o código já está pronto (`render.yaml`, CI ativo, código antigo removido); faltam só os passos de conta, que são do responsável ([#18](https://github.com/douglasabnovato/my-money-app/issues/18)).

**Estado em 16/11/2026:** `https://my-money-web.onrender.com` responde 404 com `x-render-routing: no-server` (nenhum serviço com esse nome). `https://my-money-api.onrender.com/health` responde 404 com `x-render-origin-server: Render`: o nome pode estar em uso por outro serviço, talvez de outra conta. Se o Render criar a API com outro endereço (ex.: `my-money-api-xxxx`), siga o passo 5 da Etapa 2.

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

Padrão do portfólio: **o cluster M0 atual**, com **um usuário e um banco por app** (como no instagram-feed e no aircnc). Para este app:

| App | Usuário do Atlas | Banco (na URI) | Permissão |
|---|---|---|---|
| my-money-app | `mymoney-app` | `mymoney` | `readWrite` só em `mymoney` (Database = `mymoney`, Collection vazia) |

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
| CI no Node 22, com `e2e` e `auditoria` | `.github/workflows/ci.yml` | Mesma versão do Render; o fluxo principal é testado no navegador antes do merge |

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

Tudo abaixo é do responsável: conta, segredo e serviço. Nenhum valor secreto vai para o repositório.

### Etapa 0 · Conferir o código localmente (opcional)

1. `git clone https://github.com/douglasabnovato/my-money-app && cd my-money-app`
2. `cd backend && npm ci && npm test` (esperado em 16/11/2026: 11 testes passando).
3. `cd ../frontend && npm ci && npm test && npm run build` (esperado: 13 testes passando e a pasta `dist/` criada).
4. `npx playwright install chromium && npm run test:e2e` (esperado: 3 testes passando; sobe sozinho a API em memória).

### Etapa 1 · Banco no MongoDB Atlas

1. Entrar em **cloud.mongodb.com** e abrir o projeto do **cluster M0 atual** do portfólio. Não crie outro cluster: um projeto aceita um só M0.
2. **Database Access → Add New Database User**:
   - Authentication Method: **Password**.
   - Username: `mymoney-app`.
   - Password: botão **Autogenerate Secure Password** (só letras e números). Copie a senha para um lugar seguro; não cole em issue nem em arquivo do repositório.
   - Database User Privileges: **Specific Privileges → Add Specific Privilege** → Role `readWrite`, Database `mymoney`, Collection em branco.
   - **Add User**.
3. **Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**, se ainda não existir. O Render Free não tem IP fixo.
4. **Database → Connect → Drivers**: copiar a URI e acrescentar `/mymoney` antes do `?`:
   `mongodb+srv://mymoney-app:<senha>@<seu-cluster>.mongodb.net/mymoney?retryWrites=true&w=majority`
5. Dados antigos: só se você usar um banco que já tem ciclos da versão antiga. Depois de criar a sua conta no app publicado, rode no seu computador, com `backend/.env` apontando para esse banco: `cd backend && npm run claim-orphans -- <seu e-mail>`. Em banco novo, pule.

### Etapa 2 · Serviços no Render (Blueprint)

1. Entrar em **dashboard.render.com** com a conta do GitHub e autorizar o repositório `douglasabnovato/my-money-app`.
2. **New → Blueprint** → escolher `douglasabnovato/my-money-app`, branch `main` → **Connect**.
3. O Render lista `my-money-api` (Web Service, Free) e `my-money-web` (Static Site). Ele pede um único valor: **`MONGODB_URI`** → colar a URI da Etapa 1. O `AUTH_SECRET` é gerado sozinho (`generateValue`).
4. **Apply**. Acompanhar **Logs** da API até aparecer `My Money API na porta 10000` (3 a 5 min).
5. Se o endereço da API ou do site não for o previsto (o Render acrescenta um sufixo quando o nome está em uso):
   - na API → **Environment** → `CORS_ORIGINS` = endereço real do site → **Save Changes**;
   - no site → **Environment** → `VITE_API_BASE` = endereço real da API (sem barra no final) → **Save, rebuild, and deploy** (a variável do Vite entra no build);
   - depois, corrigir os dois valores no `render.yaml` por PR, para o Blueprint não voltar ao valor antigo.

### Etapa 3 · Conferir no ar

1. `curl -s https://my-money-api.onrender.com/health` responde `{"status":"ok"}` (ou o endereço real).
2. `https://my-money-web.onrender.com` abre a tela de login (se der erro de rede, a API está acordando: aguarde 1 min).
3. Criar uma conta com dados fictícios (`@empresa.test`), cadastrar um ciclo com um crédito e um débito e ver o painel somar os valores em reais.
4. Abrir uma janela anônima, criar outra conta e confirmar que o ciclo da primeira não aparece.
5. Recarregar a página (F5) em `/#/billingCycles`: continua na mesma tela.
6. No DevTools (aba Network), as chamadas vão para a API sem erro de CORS.

### Etapa 4 · Fechar

1. Comentar na [#18](https://github.com/douglasabnovato/my-money-app/issues/18) a decisão e os endereços reais, com o código HTTP de cada um.
2. Se os endereços forem diferentes dos previstos, corrigir `render.yaml` e `Readme.md` por PR.
3. No GitHub, **About → Website**: colar o endereço do site.
4. Em N1 a publicação não é obrigatória. Se decidir não publicar, registre na #18 e deixe este guia como referência.
