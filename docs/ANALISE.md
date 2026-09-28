# Análise — My Money App

## 1. Especificação

Controle financeiro pessoal por **ciclos de pagamento** (mês/ano) com listas de créditos e débitos (status pago/pendente/agendado) e dashboard consolidado. Cadastro e login com JWT.

| Ator | Objetivo |
|---|---|
| Pessoa usuária | Registrar entradas e saídas do mês e ver o saldo consolidado |

### Requisitos funcionais

| ID | Requisito | Critério de aceite | Antes |
|---|---|---|---|
| RF01 | Cadastro/login | Senha forte; e-mail único; sessão de 1 dia | ⚠️ token com hash da senha |
| RF02 | CRUD de ciclos | Incluir, alterar e excluir **somente os meus** | ❌ todos veem tudo |
| RF03 | Resumo | Créditos − débitos do usuário, em reais | ⚠️ soma global, ponto flutuante |
| RF04 | Executar o projeto hoje | `npm install && npm run dev` no Node 20 | ❌ react-scripts 1.1.5 |

## 2. Defeitos encontrados

| # | Severidade | Defeito | Referência |
|---|---|---|---|
| D1 | Crítica | `jwt.sign({ ...user })` serializa o documento Mongoose (inclui o hash da senha) no token, legível por qualquer um | OWASP A04/A07:2025 |
| D2 | Crítica | Ciclos não têm dono: qualquer usuário autenticado lê, altera e apaga os ciclos de todos | OWASP A01:2025 |
| D3 | Alta | Front em react-scripts 1.1.5 (webpack 3) não roda no Node atual | OWASP A03:2025 |
| D4 | Alta | node-restful (2014) sem manutenção; validação vira HTTP 500 | — |
| D5 | Média | URL do Mongo e porta fixas; segredo JWT em arquivo `.env` com código JS | 12-Factor III |
| D6 | Média | Front quebra (`e.response` indefinido) quando a API está fora | OWASP A10:2025 |
| D7 | Média | Imagens do avatar em `lorempixel.com` (serviço extinto); contraste do tema abaixo de 4,5:1 | WCAG 1.4.3 |

## Rubrica v2 (grupo fullstack)

Aprovação: média ponderada ≥ 7,0 **e** C1 e C4 (eliminatórios) ≥ 5. Regras: nota sem evidência vale no máximo 6; C1 limitado a 7 para parte não executada de ponta a ponta; C9 ≥ 8 só com URL publicada e CI verde.

| # | Critério | Referência | Peso | Antes | Depois | Evidência | Justificativa |
|---|---|---|---|---|---|---|---|
| C1 | Núcleo de valor | MVP (Ries); SWEBOK Requirements | 16% | 4 | 8 | E2E Playwright: cadastro → login → incluir ciclo → dashboard R$ 3.499,50 | Front não compila no Node atual (react-scripts 1.1.5); back depende de libs sem manutenção |
| C2 | Estados e condições excepcionais | Nielsen; OWASP A10:2025 | 8% | 3 | 8 | Testes 400/401/404/409/500; reducers com erro testados | Erros de validação voltam 500; front quebra quando não há resposta |
| C3 | Acessibilidade | WCAG 2.2 AA (axe-core) | 7% | 3 | 8 | axe-core: 0 violações (login e painel após o fluxo) | Menu e abas com `href` vazio/`javascript:`, rótulos sem ligação, contraste do tema |
| C4 | Segurança e privacidade | OWASP Top 10:2025 / ASVS 5.0 N1 | 14% | 1 | 8 | Testes: JWT sem hash, IDOR entre usuários, senha forte | `jwt.sign({...user})` coloca o hash da senha no token; ciclos visíveis a todos os usuários |
| C5 | Dados | 3FN / ACID / fonte única | 10% | 4 | 8 | Modelo com userId + índice; script de migração dos ciclos antigos | Ciclos sem dono; soma com ponto flutuante |
| C6 | Testes | Pirâmide de testes; SWEBOK Testing | 9% | 0 | 7 | 9 testes de API + 4 de UI | Nenhum teste |
| C7 | Qualidade de código | SOLID / camadas; SWEBOK Construction | 7% | 5 | 8 | Repositórios injetáveis (Mongo/memória); domínio puro do resumo | Camadas razoáveis, mas acopladas ao node-restful |
| C8 | Desempenho | Complexidade; Core Web Vitals | 5% | 5 | 7 | Resumo por agregação; listas paginadas (limit 100) | Sem paginação |
| C9 | Operação | 12-Factor; DORA | 7% | 2 | 7 | `/health`; render.yaml; CI em `ci/` (não executado) | Mongo e porta fixos; segredo em arquivo `.env` JS |
| C10 | Documentação | README como contrato | 5% | 4 | 8 | README + docs/ | Checklist de aula |
| C11 | Produto e evidência | Cagan (4 riscos); Torres | 7% | 4 | 6 | Métrica: ciclos por usuário (`/count`); sem instrumentação de uso | Produto claro (controle mensal), sem métrica |
| C12 | Sustentabilidade técnica | OWASP A03:2025; SWEBOK Maintenance | 5% | 1 | 8 | `npm audit`: 0 (back e front); CRA 1.x e node-restful removidos | react-scripts 1, node-restful (2014), bcrypt nativo, jQuery 2 |

**Média ponderada:** antes **2,9** (REPROVADO) → depois **7,65** (APROVADO).

