# Plano de ação — My Money App

Timebox: 90 min (fullstack + migração de build).

| MoSCoW | Item | Ganho | Esforço | Status |
|---|---|---|---|---|
| Must | JWT sem dados sensíveis (D1) | Alto | Baixo | ✅ |
| Must | Ciclos por usuário (D2) | Alto | Médio | ✅ |
| Must | Front rodando no Node 20 com Vite (D3) | Alto | Alto | ✅ |
| Must | Config por ambiente; segredo obrigatório (D5) | Alto | Baixo | ✅ |
| Should | Rotas explícitas + zod (D4) | Médio | Médio | ✅ |
| Should | Erros de rede tratados; contraste e rótulos (D6, D7) | Médio | Médio | ✅ axe 0 |
| Could | Gráfico de evolução mensal | Médio | Médio | Próximo ciclo |

## Ciclo de 03/11/2026

Executado em 06/11/2026, nas branches `feature/2026-11-06` → `developer/sprint-2026-11-12` → `main`.

### Produto

**Problema e público.** Quem estuda React com Redux quer um app de finanças pessoais que registre ciclos mensais de créditos e débitos e mostre o saldo.

**Hipótese e meta (proposta).** Praticar React com Redux: criar conta e ver o painel em menos de 1 minuto.

**O que a pesquisa trouxe.**

| Ideia | Fonte | Uso aqui |
|---|---|---|
| O orçamento pessoal compara receitas e despesas para chegar a uma sobra; o objetivo é fechar o mês com superávit | [Banco Central, Caderno de Educação Financeira](https://www.bcb.gov.br/pre/pef/port/caderno_cidadania_financeira.pdf) | O painel mostra quanto dos créditos sobrou, ou quanto os débitos passaram |
| Não existe percentual ideal único de poupança; cada pessoa define o seu | [Monitor do Mercado](https://monitordomercado.com.br/economia-2/366920-especialista-explica-por-que-nao-existe-porcentagem-ideal-para-cada-gasto-do-orcamento/) | O app mostra a taxa sem julgar se é boa ou ruim |

**Backlog priorizado (impacto × esforço).**

| Item | Impacto | Esforço | Destino |
|---|---|---|---|
| Taxa de poupança e resumo incompleto tratado | Médio | Baixo | Este ciclo |
| CI nos PRs para `developer/**` | Médio | Baixo | Este ciclo |
| Teste do cadastro de ciclo na tela | Alto | Médio | #15 |
| Estado de carregamento | Médio | Baixo | #16 |
| Evolução mensal | Médio | Médio | #19 |
| Proteção da `main` e publicação | Médio | Baixo (responsável) | #17, #18 |

**Fora do escopo.** Importação bancária e metas.

### Engenharia

**Arquitetura.** API Express 5 com rotas explícitas, zod e JWT; repositórios em memória (testes) ou MongoDB. Front React 18 + Redux, com Vite. O cálculo do consolidado fica em `frontend/src/common/format.js`.

**Riscos.** Sem publicação, ninguém de fora vê o app. A principal aceita push direto.

**Qualidade.** `node --test` na API (9), Vitest no front (8), build no CI. axe sem violações no último ciclo. Sem alertas no `npm audit --omit=dev`.

**Definição de pronto.** CI verde, teste novo, `MVP.md` e README atualizados.

### Plano de ação

**Executado neste ciclo.** Taxa de poupança no painel; reducer que transforma resposta sem dados em zero; gatilho do CI para `developer/**`; régua N1 e critério 10 corrigidos no `MVP.md`; seção de estado no README.

**Vira issue.** #15 a #19, listadas no README.

## Ciclo de 07/11/2026

> Executado em 09/11/2026. Nível N1. Sprint `developer/sprint-2026-11-12`, feature `feature/2026-11-07`.

### Produto

**Problema e público.** Quem controla finanças registra ciclos mensais de créditos e débitos e vê o saldo. Sem mudança.

**Meta do ciclo.** Fechar os critérios 3 (fluxo principal) e 6 (falhas tratadas): percorrer o cadastro de ciclo na tela e mostrar o carregamento.

**O que a pesquisa trouxe.**
- Mensagens de carregamento entram no critério 4.1.3 do WCAG (mensagens de status): devem ser anunciadas sem receber foco, com `role="status"`; erro com `role="alert"`. Fonte: [WCAG 4.1.3, explicação](https://wcag.dock.codes/documentation/wcag-success-criteria/wcag413/) e [briefing sobre estados de carregamento](https://a11y-fundamentals.netlify.app/briefings/4.1).
- Em português, o teclado do celular com `inputmode="decimal"` mostra vírgula, e campos numéricos variam entre navegadores; a recomendação é aceitar vírgula e ponto e converter no cliente e no servidor. Fontes: [Adobe React Aria, campo numérico internacional](https://react-aria.adobe.com/blog/how-we-internationalized-our-numberfield) e [W3C, formulários por localidade](https://www.w3.org/International/wiki/Locale-based_forms). O percurso na tela confirmou: "1500,50" era recusado pela API.

**Backlog do ciclo (impacto × esforço).**

| # | Item | Impacto | Esforço | Situação |
|---|---|---|---|---|
| 1 | API aceita valor com vírgula (achado no percurso) | Alto | Baixo | Feito |
| 2 | Carregamento no painel e na lista (#16) | Médio | Baixo | Feito |
| 3 | Teste do cadastro de ciclo na tela (#15) | Médio | Baixo | Feito |
| 4 | CI em push para `developer/**` | Baixo | Baixo | Feito |
| 5 | Mensagens de validação da API em português | Médio | Baixo | Issue |
| 6 | Evolução mensal no painel (#19) | Médio | Médio | Próximo ciclo |

**Fora do escopo.** Publicação (#18), importação bancária, metas.

### Engenharia

**Arquitetura.** Front React 18 + Redux (multi, thunk, promise) com Vite; API Express 5 + zod + Mongoose, com repositório em memória para testes e demonstração. As ações de busca agora despacham `*_REQUESTED` antes da promessa (redux-multi), e os reducers guardam `loading`. O esquema `money` da API converte "1.500,50" e "1500,50" antes de validar.

**Riscos.** A conversão trata a vírgula como separador decimal e o ponto como milhar quando há vírgula; "1.500" sem vírgula continua 1,5. Sem proteção na `main` (#17).

**Qualidade.** API: 10 testes (`npm test`). Front: 13 (`npx vitest run`) e build. Fluxo percorrido no navegador com axe.

**Definição de pronto.** CI verde no PR para a sprint; `docs/MVP.md` e README atualizados; PR da sprint para a `main` com `revisao-responsavel`.

### Plano de ação

**Este ciclo executa.** Itens 1 a 4.

**Vira issue.** Mensagens da API em português; título da tela em ordem (axe `heading-order`); #19 segue; #17 e #18 com o responsável.
