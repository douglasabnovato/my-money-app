# MVP — my-money-app

> Criado em 02/11/2026. Meta: N1 (estudo). Testado no Windows, com Node 24, na cópia de `main`. Não houve teste com pessoas nem em aparelho real.

**Nível:** N1 (estudo). **Resumo em 06/11/2026:** 7 de 10 critérios aplicáveis atendem (1, 2, 4, 8, 9, 11, 12); 3 parciais (3, 6, 10); 5 e 7 não se aplicam (N1). **Finalizado: não.** Faltam os critérios 3 e 6 (#15, #16), que o código resolve; o 10 depende do responsável (#17).

## 1. Critérios: 7 de 10 aplicáveis atendidos

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

## 2. Hipótese (proposta)

Praticar React com Redux: criar conta e ver o painel em menos de 1 minuto.

## 3. Fora do MVP

Importação bancária e metas.

## 4. Neste ciclo

Corrige o contraste do botão principal e o foco visível, e atualiza dependências.

## 5. Revisão de 06/11/2026 (ciclo de 03/11/2026)

- Régua N1: critérios 5 e 7 passam a "Não se aplica" e saem do denominador.
- Critério 10 vai de "Atende" para "Parcial", porque a principal não tem proteção.
- Critério 9 vai para "Atende": sem alertas no `npm audit --omit=dev`.
- O painel mostra a parte dos créditos que sobrou e trata resumo incompleto. Testes do front: 8 (antes 4). API: 9.
