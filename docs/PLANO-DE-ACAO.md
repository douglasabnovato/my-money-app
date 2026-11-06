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
