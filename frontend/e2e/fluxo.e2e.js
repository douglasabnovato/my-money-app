/* Fluxo principal no navegador: criar conta, cadastrar um ciclo e ver o painel somar; axe em cada tela e teste de teclado */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/* Conta fictícia, única por execução */
function conta(prefixo) {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  return { nome: `Pessoa Teste ${prefixo}`, email: `${prefixo}.${id}@empresa.test`, senha: 'Teste1234' }
}

/* axe sem violações nas regras WCAG A e AA, mais a ordem dos títulos (#24) */
async function semViolacoes(page) {
  const wcag = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(wcag.violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([])
  const titulos = await new AxeBuilder({ page }).withRules(['heading-order', 'page-has-heading-one']).analyze()
  expect(titulos.violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([])
}

test('cria conta, cadastra um ciclo com valor em reais e vê o painel somar', async ({ page }) => {
  const { nome, email, senha } = conta('fluxo')
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'My Money' })).toBeVisible()
  await semViolacoes(page)

  await page.getByRole('button', { name: 'Novo usuário? Registrar aqui!' }).click()
  await page.getByLabel('Nome').fill(nome)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(senha)
  await page.getByLabel('Confirmar senha').fill(senha)
  await page.getByRole('button', { name: 'Registrar' }).click()

  await expect(page.getByRole('heading', { level: 1, name: /Dashboard/ })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Cadastre créditos para ver quanto sobra.' })).toBeVisible()
  await semViolacoes(page)

  await page.getByRole('link', { name: 'Ciclos de Pagamentos' }).click()
  await expect(page.getByRole('heading', { level: 1, name: /Ciclos de Pagamentos/ })).toBeVisible()
  await expect(page.getByText('Nenhum ciclo cadastrado. Use a aba “Incluir”.')).toBeVisible()

  await page.getByRole('tab', { name: 'Incluir' }).click()
  await page.getByLabel('Nome', { exact: true }).fill('Novembro')
  await page.getByLabel('Mês').selectOption({ label: 'Novembro' })
  await page.getByLabel('Ano').fill('2026')
  await page.getByLabel('Créditos: nome da linha 1').fill('Salário')
  await page.getByLabel('Créditos: valor da linha 1').fill('4000')
  await page.getByLabel('Débitos: nome da linha 1').fill('Aluguel')
  await page.getByLabel('Débitos: valor da linha 1').fill('1500,50')
  await page.getByLabel('Status da linha 1').selectOption('PAGO')
  await expect(page.locator('#tabCreate .box-body')).toContainText(/R\$\s2\.499,50/)
  await semViolacoes(page)

  /* Um POST real do navegador para a API: pega erro de origem e de CORS */
  await page.getByRole('button', { name: 'Incluir', exact: true }).click()
  await expect(page.getByText('Operação realizada com sucesso.')).toBeVisible()
  const linha = page.getByRole('row').filter({ hasText: 'Novembro' })
  await expect(linha).toContainText('2026')
  await expect(page.getByRole('button', { name: 'Alterar Novembro' })).toBeVisible()
  await semViolacoes(page)

  await page.getByRole('complementary', { name: 'Menu principal' }).getByRole('link', { name: 'Dashboard' }).click()
  const painel = page.locator('#conteudo')
  await expect(painel.locator('.small-box.bg-green')).toContainText(/R\$\s4\.000,00/)
  await expect(painel.locator('.small-box.bg-red')).toContainText(/R\$\s1\.500,50/)
  await expect(painel.locator('.small-box.bg-blue')).toContainText(/R\$\s2\.499,50/)
  await expect(page.getByRole('status').filter({ hasText: /Sobraram 62\s?% dos créditos/ })).toBeVisible()
  await semViolacoes(page)
})

test('cria conta só com o teclado, com foco visível em cada campo', async ({ page }) => {
  const { nome, email, senha } = conta('teclado')
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'My Money' })).toBeVisible()

  /* Ordem do Tab no login: e-mail, senha, Entrar, link de cadastro */
  const ordemLogin = ['auth-email', 'auth-password']
  for (const id of ordemLogin) {
    await page.keyboard.press('Tab')
    await expect(page.locator(`#${id}`)).toBeFocused()
  }
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeFocused()
  await page.keyboard.press('Tab')
  const cadastro = page.getByRole('button', { name: 'Novo usuário? Registrar aqui!' })
  await expect(cadastro).toBeFocused()
  /* O contorno é o que o app define em custom.css (3px, azul), não o padrão do navegador */
  const contorno = await cadastro.evaluate(el => { const c = getComputedStyle(el); return `${c.outlineWidth} ${c.outlineStyle} ${c.outlineColor}` })
  expect(contorno).toBe('3px solid rgb(27, 94, 156)')
  await page.keyboard.press('Enter')

  /* O botão vira "Já é cadastrado?" e o foco fica nele; Shift+Tab volta ao primeiro campo (Nome) */
  await expect(page.getByRole('button', { name: 'Já é cadastrado? Entrar aqui!' })).toBeFocused()
  /* Shift+Tab até o campo Nome, com limite, sem depender do número exato de paradas */
  for (let i = 0; i < 10 && !(await page.locator('#auth-name').evaluate(el => el === document.activeElement)); i++) {
    await page.keyboard.press('Shift+Tab')
  }
  const campos = [['auth-name', nome], ['auth-email', email], ['auth-password', senha], ['auth-confirm_password', senha]]
  for (const [id, valor] of campos) {
    await expect(page.locator(`#${id}`)).toBeFocused()
    await page.keyboard.type(valor)
    await page.keyboard.press('Tab')
  }
  await expect(page.getByRole('button', { name: 'Registrar' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: /Dashboard/ })).toBeVisible()
})
test('valor inválido mostra o erro em português e não salva o ciclo (#23)', async ({ page }) => {
  const { nome, email, senha } = conta('erro')
  await page.goto('/')
  await page.getByRole('button', { name: 'Novo usuário? Registrar aqui!' }).click()
  await page.getByLabel('Nome').fill(nome)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(senha)
  await page.getByLabel('Confirmar senha').fill(senha)
  await page.getByRole('button', { name: 'Registrar' }).click()
  await expect(page.getByRole('heading', { level: 1, name: /Dashboard/ })).toBeVisible()

  await page.getByRole('link', { name: 'Ciclos de Pagamentos' }).click()
  await page.getByRole('tab', { name: 'Incluir' }).click()
  await page.getByLabel('Nome', { exact: true }).fill('Dezembro')
  await page.getByLabel('Mês').selectOption({ label: 'Dezembro' })
  await page.getByLabel('Ano').fill('2026')
  await page.getByLabel('Débitos: nome da linha 1').fill('Aluguel')
  await page.getByLabel('Débitos: valor da linha 1').fill('abc')
  await page.getByRole('button', { name: 'Incluir', exact: true }).click()

  /* A API responde 400 com a frase em português, e a tela mostra a frase, sem o texto interno do zod */
  await expect(page.getByText('Débitos, linha 1, valor: informe um valor válido')).toBeVisible()
  await expect(page.getByText(/Invalid input|expected number/)).toHaveCount(0)
  await page.getByRole('tab', { name: 'Listar' }).click()
  await expect(page.getByText('Nenhum ciclo cadastrado. Use a aba “Incluir”.')).toBeVisible()
})
/* Fim de fluxo.e2e.js */
