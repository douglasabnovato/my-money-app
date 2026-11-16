# MVP — my-money-app

> Revisto em 16/11/2026 (ciclo de 16/11/2026). **Nível: N1 (estudo).** Meta: N1. Testado no Windows com Node 24 e no CI com Node 22. Não houve teste com pessoas nem em aparelho real. O app não tem tema escuro próprio (o CSS não tem `prefers-color-scheme`): o axe roda só no tema claro.

**Resumo:** 9 de 10 aplicáveis atendidos
**Finalizado:** sim

Régua N1: os critérios 5 e 7 são "Não se aplica (N1)" e saem do denominador. Antes deste ciclo o resumo dizia 10 de 10, mas os critérios 3 e 8 não tinham a evidência que a régua pede (teste Playwright no CI, com axe dentro dele) e o 9 contava só o `npm audit`. Revisto contra a régua, o estado de partida era 7 de 10. Agora: 9 de 10. O único critério fora de "Atende" é o 9, que depende do responsável (#29, `depende-do-responsavel`); por isso **Finalizado: sim**. O ciclo ainda não está na `main`: espera a revisão do responsável.

| # | Critério | Como verificar | Situação (16/11/2026) |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem controla finanças registra ciclos mensais de créditos e débitos e vê o saldo. |
| 2 | Hipótese a validar | Aposta escrita, com meta | Atende: seção "Hipótese", com meta e "saberemos quando"; ainda sem validação com pessoas. |
| 3 | Fluxo principal completo | Teste Playwright no navegador, no CI | Atende: `frontend/e2e/fluxo.e2e.js`, teste "cria conta, cadastra um ciclo com valor em reais e vê o painel somar": registro → Ciclos de Pagamentos → Incluir (crédito 4000, débito "1500,50" pago) → POST real do navegador para a API em memória → "Operação realizada com sucesso." → ciclo na lista → painel com R$ 4.000,00, R$ 1.500,50, R$ 2.499,50 e "Sobraram 62% dos créditos". `npm run test:e2e` em 16/11/2026: 3 de 3, três execuções seguidas; no CI, job `e2e` verde no run 43809536193. |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção "Fora do MVP". |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1): projeto de estudo sem coleta de uso. |
| 6 | Falhas tratadas | Erro, vazio e carregamento | Atende: carregamento (`role="status"`), vazio e erro de rede (`role="alert"`) em `frontend/src/__tests__/ciclo.test.jsx` (`npm test`, 13 de 13, 16/11/2026); no navegador, o e2e "valor inválido mostra o erro em português e não salva o ciclo (#23)" confere o aviso "Débitos, linha 1, valor: informe um valor válido" e a lista vazia (run 43809536193). |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1): sem publicação; decisão em #18. |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe (`@axe-core/playwright`, regras WCAG 2.0/2.1 A e AA, mais `heading-order` e `page-has-heading-one`) sem violações em 5 telas do e2e, com dados reais e largura de desktop (1280 px): login, painel vazio, formulário preenchido, lista com o ciclo e painel com valores. Teste de teclado: Tab no login (e-mail, senha, Entrar, cadastro), contorno `3px solid rgb(27, 94, 156)` definido no `custom.css`, cadastro feito só com Tab, Shift+Tab, digitação e Enter. O e2e achou e o ciclo corrigiu: `heading-order` no painel (#24), `aria-required-parent` e `list` nas abas, `color-contrast` no meio da animação do aviso (cor final: branco sobre `#2e7d32`). Alcance dessa última correção: a animação fica em 1 ms só para quem pede "reduzir movimento", e o e2e roda com `reducedMotion: 'reduce'`; para os demais, o aviso ainda passa 1 s em fade, com contraste baixo só durante a transição. Só tema claro: o app não tem tema escuro próprio. Run 43809536193. |
| 9 | Segurança e conformidade | audit e alertas do Dependabot | Parcial: `npm audit --omit=dev` sem alertas na API e no front em 16/11/2026, depois do Mongoose 8.24.9 (a 8.24.4 tinha 4 avisos altos), e job `auditoria` no CI. Mas a API de alertas do Dependabot responde 403 (desligada); a regra para esse caso está em decisão na [engenharia#33](https://github.com/douglasabnovato/engenharia/issues/33). Ligar os alertas: #29 (responsável). Sem segredo no código; dados de teste com `@empresa.test`. |
| 10 | Entrega confiável | CI verde antes da principal | Atende: `gh api repos/douglasabnovato/my-money-app/rules/branches/main` em 16/11/2026: `deletion`, `non_fast_forward`, `pull_request` e `required_status_checks` (`backend`, `frontend`). O CI roda nos PRs e em push para `main` e `developer/**`. O job `e2e` ainda não bloqueia o merge na `main`; exigir: #30. |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: API 11 testes (`npm test`), front 13 (`npm test`), e2e 3 (`npm run test:e2e`), em 16/11/2026, nenhum `skipped`; os três rodam no CI (run 43809536193). |
| 12 | Documentação honesta | Qualquer pessoa roda o projeto | Atende: README com os comandos conferidos contra os `package.json` em 16/11/2026 (`dev`, `test`, `build`, `test:e2e`); sem link publicado (o endereço no Render dá 404). |

## Hipótese

Acreditamos que um fluxo curto (criar conta, cadastrar um ciclo e ver o saldo no painel) faz quem estuda React com Redux entender o projeto rodando, sem ler o código. **Meta:** o fluxo inteiro em menos de 1 minuto. **Saberemos quando** o teste e2e do fluxo principal passar no CI em menos de 1 minuto (em 16/11/2026: 4,8 s no CI, run 43809536193; 19 a 26 s no Windows) e uma pessoa concluir o mesmo percurso sem ajuda em menos de 3 minutos (ainda não testado com pessoas).

## Fora do MVP

Importação bancária, metas, gráfico com biblioteca externa e publicação obrigatória (N1).

## Neste ciclo (16/11/2026)

Mongoose 8.24.9 e patches de produção; teste Playwright do fluxo principal com axe e teclado, jobs `e2e` e `auditoria` no CI; títulos em ordem no painel (#24) e abas com `tablist`; mensagens da API em português (#23); avisos sem animação longa com "reduzir movimento"; código morto do CRA removido; `docs/DEPLOY.md` atualizado. Detalhes em [PLANO-DE-ACAO.md](PLANO-DE-ACAO.md), seção "Ciclo de 16/11/2026".

## Histórico

### Estado em 09/11/2026 (ciclo de 07/11/2026; critério 10 revisto em 10/11/2026)

> Revisão de 16/11/2026: este estado dizia 10 de 10, mas os critérios 3 e 8 não tinham Playwright nem axe no CI, e o 9 contava só o audit. Contra a régua atual, era 7 de 10.

> Revisto em 09/11/2026 (ciclo de 07/11/2026). **Nível: N1 (estudo).** Meta: N1. Testado no Windows com Node 24 e no CI com Node 22. Não houve teste com pessoas nem em aparelho real.

Resumo em 09/11/2026: 10 de 10 aplicáveis atendidos (declarado).
Finalizado em 09/11/2026: sim (declarado).

Régua N1: os critérios 5 e 7 são "Não se aplica (N1)" e saem do denominador. Antes deste ciclo: 7 de 10. O 10 passou a "Atende" em 10/11/2026, com a `main` protegida (#17). O ciclo ainda não está na `main`: espera a revisão do responsável.

| # | Critério | Como verificar | Situação (09/11/2026; critério 10 revisto em 10/11/2026) |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem controla finanças registra ciclos de créditos e débitos. |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: seção "Hipótese"; ainda sem validação com pessoas. |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Atende: em 09/11, API com `MONGODB_URI=memory` (`node src/server.js`) e front com `npx vite`, percorri no navegador embutido do app: registro → Ciclos de Pagamentos → Incluir (nome, mês, ano, crédito 4000, débito "1500,50" pago) → resumo do formulário R$ 2.499,50 → "Operação realizada com sucesso" → ciclo na lista → painel com R$ 4.000,00, R$ 1.500,50, R$ 2.499,50 e "Sobraram 62% dos créditos". O percurso achou um erro (valor com vírgula era recusado pela API com 400), corrigido com teste. Teste de tela: `frontend/src/__tests__/ciclo.test.jsx` (#15). |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção "Fora do MVP". |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1): projeto de estudo sem coleta de uso. |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: painel e lista mostram "Carregando…" com `role="status"`; vazio ("Nenhum ciclo cadastrado", "Cadastre créditos") só depois de carregar; erro de rede com `role="alert"`; token inválido volta ao login (visto em 09/11). `npx vitest run` em 09/11: 13 de 13 (#16). |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1): sem publicação; decisão em #18. |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe-core 4.10 no painel em 09/11: só `heading-order` (moderado); rótulos nos campos do ciclo; foco visível conferido em 06/11. |
| 9 | Segurança e conformidade | Riscos decididos | Atende: `npm audit --omit=dev` sem alertas na API e no front em 06/11/2026 (zod 4, PR #13); sem dependência nova neste ciclo. |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Atende: `gh api repos/douglasabnovato/my-money-app/rulesets`, em 10/11/2026: ruleset `principal-protegida` ativo (exige PR, bloqueia force push e exclusão); o workflow `CI` roda nos PRs e em push para `main` e `developer/**` (#17). |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: API 10 testes (`npm test`, 09/11), front 13 (`npx vitest run`, 09/11), build no CI. |
| 12 | Documentação honesta | O README ensina a rodar | Atende: README com o ciclo de 07/11 e o modo em memória. |

#### Hipótese (proposta)

Praticar React com Redux: criar conta e ver o painel em menos de 1 minuto.

#### Fora do MVP

Importação bancária e metas.

#### Neste ciclo (07/11/2026)

Carregamento no painel e na lista (#16), teste do cadastro de ciclo na tela (#15), API aceita valor com vírgula, CI em push para `developer/**`, fluxo percorrido na tela. Detalhes em [PLANO-DE-ACAO.md](PLANO-DE-ACAO.md), seção "Ciclo de 07/11/2026".


### Estado em 06/11/2026 (ciclo de 03/11/2026)

> Criado em 02/11/2026. Meta: N1 (estudo). Testado no Windows, com Node 24, na cópia de `main`. Não houve teste com pessoas nem em aparelho real.

**Nível:** N1 (estudo). **Resumo em 06/11/2026:** 7 de 10 critérios aplicáveis atendem (1, 2, 4, 8, 9, 11, 12); 3 parciais (3, 6, 10); 5 e 7 não se aplicam (N1). **Finalizado: não.** Faltam os critérios 3 e 6 (#15, #16), que o código resolve; o 10 depende do responsável (#17).

#### 1. Critérios: 7 de 10 aplicáveis atendidos

| # | Critério | Como verificar | Situação |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: Quem controla finanças registra ciclos de créditos e débitos. |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: Proposta na seção 2; ainda sem validação com pessoas. |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Parcial: No navegador, com repositório em memória: registro e painel. O cadastro de ciclo não foi percorrido na tela; a API tem testes (#15). |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: Seção 3. |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1): projeto de estudo sem coleta de uso. |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Parcial: Sem API, o formulário mostrou "Sem conexão"; resumo vazio mostra "Cadastre créditos" (teste de 06/11/2026). Falta o carregamento (#16). |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1): sem publicação; decisão em #18. |
| 8 | Acessibilidade básica | axe e teclado | Atende: Depois da correção, axe sem violações, foco visível em 5 de 5 tabulações; sem rolagem em 375 px. |
| 9 | Segurança e conformidade | Riscos decididos | Atende: `npm audit --omit=dev` sem alertas na API e no front em 06/11/2026 (zod 4, PR #13). |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Parcial: CI verde nos PRs, mas a principal não tem proteção (#17). |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: Testes automatizados rodam no CI. |
| 12 | Documentação honesta | O README ensina a rodar | Atende: Comandos conferidos com o `package.json`; aviso de estudo no README. |

#### 2. Hipótese (proposta)

Praticar React com Redux: criar conta e ver o painel em menos de 1 minuto.

#### 3. Fora do MVP

Importação bancária e metas.

#### 4. Neste ciclo

Corrige o contraste do botão principal e o foco visível, e atualiza dependências.

#### 5. Revisão de 06/11/2026 (ciclo de 03/11/2026)

- Régua N1: critérios 5 e 7 passam a "Não se aplica" e saem do denominador.
- Critério 10 vai de "Atende" para "Parcial", porque a principal não tem proteção.
- Critério 9 vai para "Atende": sem alertas no `npm audit --omit=dev`.
- O painel mostra a parte dos créditos que sobrou e trata resumo incompleto. Testes do front: 8 (antes 4). API: 9.
