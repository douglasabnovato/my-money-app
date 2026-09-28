/* Regras do resumo financeiro: soma de créditos e débitos com arredondamento em centavos */

/* Soma valores monetários sem acumular erro de ponto flutuante */
function sumMoney(items = []) {
  const cents = items.reduce((total, item) => total + Math.round(Number(item.value || 0) * 100), 0);
  return cents / 100;
}

/* Resumo de uma lista de ciclos */
function summarize(cycles = []) {
  const credit = sumMoney(cycles.flatMap((c) => c.credits || []));
  const debt = sumMoney(cycles.flatMap((c) => c.debts || []));
  return { credit, debt, balance: Math.round((credit - debt) * 100) / 100 };
}

module.exports = { sumMoney, summarize };
/* Fim de summary.js */
