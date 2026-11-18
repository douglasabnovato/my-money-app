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
  expect(wcag.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(" ")).join(", ")}`)).toEqual([])
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

/* Cria uma conta nova e chega ao painel */
async function registrar(page, prefixo) {
  const { nome, email, senha } = conta(prefixo)
  await page.goto('/')
  await page.getByRole('button', { name: 'Novo usuário? Registrar aqui!' }).click()
  await page.getByLabel('Nome').fill(nome)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(senha)
  await page.getByLabel('Confirmar senha').fill(senha)
  await page.getByRole('button', { name: 'Registrar' }).click()
  await expect(page.getByRole('heading', { level: 1, name: /Dashboard/ })).toBeVisible()
}

/* Na tela de ciclos, inclui um ciclo com um crédito e um débito e volta à lista */
async function incluirCiclo(page, { nome, credito, debito }) {
  await page.getByRole('tab', { name: 'Incluir' }).click()
  await page.getByLabel('Nome', { exact: true }).fill(nome)
  await page.getByLabel('Mês').selectOption({ label: nome })
  await page.getByLabel('Ano').fill('2026')
  await page.getByLabel('Créditos: nome da linha 1').fill('Salário')
  await page.getByLabel('Créditos: valor da linha 1').fill(credito)
  await page.getByLabel('Débitos: nome da linha 1').fill('Aluguel')
  await page.getByLabel('Débitos: valor da linha 1').fill(debito)
  await page.getByRole('button', { name: 'Incluir', exact: true }).click()
  await expect(page.getByRole('button', { name: `Alterar ${nome}` })).toBeVisible()
}

/* Painel: crédito, débito e saldo */
async function conferirPainel(page, credito, debito, saldo) {
  await page.getByRole('complementary', { name: 'Menu principal' }).getByRole('link', { name: 'Dashboard' }).click()
  const painel = page.locator('#conteudo')
  await expect(painel.locator('.small-box.bg-green')).toContainText(credito)
  await expect(painel.locator('.small-box.bg-red')).toContainText(debito)
  await expect(painel.locator('.small-box.bg-blue')).toContainText(saldo)
}

test('altera e exclui um ciclo, e o painel acompanha (#32)', async ({ page }) => {
  await registrar(page, 'crud')
  await page.getByRole('link', { name: 'Ciclos de Pagamentos' }).click()
  await incluirCiclo(page, { nome: 'Outubro', credito: '4000', debito: '1000' })
  await conferirPainel(page, /R\$\s4\.000,00/, /R\$\s1\.000,00/, /R\$\s3\.000,00/)

  /* Alterar: o formulário chega preenchido (initialize do redux-form) e o novo débito muda o saldo */
  await page.getByRole('link', { name: 'Ciclos de Pagamentos' }).click()
  await page.getByRole('button', { name: 'Alterar Outubro' }).click()
  await expect(page.getByRole('tab', { name: 'Alterar' })).toHaveAttribute('aria-selected', 'true')
  const debito = page.getByLabel('Débitos: valor da linha 1')
  await expect(debito).toHaveValue('1000')
  await semViolacoes(page)
  await debito.fill('2500,25')
  /* O aviso do Incluir precisa sumir antes: com preventDuplicates, o aviso igual do Alterar seria descartado */
  await expect(page.locator('.redux-toastr .toastr')).toHaveCount(0, { timeout: 8000 })
  await page.getByRole('button', { name: 'Alterar', exact: true }).click()
  await expect(page.getByText('Operação realizada com sucesso.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Alterar Outubro' })).toBeVisible()
  await conferirPainel(page, /R\$\s4\.000,00/, /R\$\s2\.500,25/, /R\$\s1\.499,75/)

  /* Excluir: o formulário fica só para leitura; confirmar no botão "Excluir" apaga o ciclo */
  await page.getByRole('link', { name: 'Ciclos de Pagamentos' }).click()
  await page.getByRole('button', { name: 'Excluir Outubro' }).click()
  await expect(page.getByRole('tab', { name: 'Excluir' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByLabel('Nome', { exact: true })).toHaveAttribute('readonly', '')
  await semViolacoes(page)
  await page.getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(page.getByText('Nenhum ciclo cadastrado. Use a aba “Incluir”.')).toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: 'Outubro' })).toHaveCount(0)
  await conferirPainel(page, /R\$\s0,00/, /R\$\s0,00/, /R\$\s0,00/)
})

test.describe('aviso com a animação normal (#35)', () => {
  /* Sem "reduzir movimento": a animação de entrada é a que a maioria das pessoas vê */
  test.use({ reducedMotion: 'no-preference' })

  test('o aviso de sucesso tem contraste desde a entrada e some sozinho', async ({ page }) => {
    await registrar(page, 'aviso')
    await page.getByRole('link', { name: 'Ciclos de Pagamentos' }).click()
    await page.getByRole('tab', { name: 'Incluir' }).click()
    await page.getByLabel('Nome', { exact: true }).fill('Setembro')
    await page.getByLabel('Mês').selectOption({ label: 'Setembro' })
    await page.getByLabel('Ano').fill('2026')
    await page.getByLabel('Créditos: nome da linha 1').fill('Salário')
    await page.getByLabel('Créditos: valor da linha 1').fill('2000')
    await page.getByLabel('Débitos: nome da linha 1').fill('Luz')
    await page.getByLabel('Débitos: valor da linha 1').fill('150')
    await page.getByRole('button', { name: 'Incluir', exact: true }).click()

    const aviso = page.locator('.redux-toastr .toastr').filter({ hasText: 'Operação realizada com sucesso.' })
    await expect(aviso).toBeVisible()
    /* axe logo depois de o aviso aparecer, ainda durante a entrada, três vezes */
    /* O axe dá como aprovado o que está fora da tela: contar as rodadas em que ele de fato avaliou o aviso */
    let avaliadas = 0
    for (let i = 0; i < 3; i++) {
      const r = await new AxeBuilder({ page }).include('.redux-toastr').withRules(['color-contrast']).analyze()
      expect(r.violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([])
      if (r.passes.some(p => p.id === 'color-contrast' && p.nodes.length > 0)) avaliadas++
      await page.waitForTimeout(100)
    }
    expect(avaliadas).toBeGreaterThan(0)
    /* timeOut de 4 s no messages.jsx, mais a saída */
    await expect(aviso).toHaveCount(0, { timeout: 8000 })
  })
})

test.describe('largura de celular (#31) @celular', () => {
  /* Sem rolagem lateral com o menu fechado: nem a página nem a moldura do AdminLTE (.wrapper, que esconde o excesso) passam da janela */
  async function semRolagemLateral(page) {
    const largura = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      moldura: document.querySelector('.wrapper').scrollWidth,
      conteudo: document.querySelector('.content-wrapper').scrollWidth,
      janela: window.innerWidth,
    }))
    expect(largura.pagina).toBeLessThanOrEqual(largura.janela)
    expect(largura.moldura).toBeLessThanOrEqual(largura.janela)
    expect(largura.conteudo).toBeLessThanOrEqual(largura.janela)
  }

  const menuAberto = page => page.evaluate(() => document.body.classList.contains('sidebar-open'))
  const botaoMenu = page => page.getByRole('button', { name: 'Mostrar ou esconder o menu' })

  /* Abre o menu lateral pelo botão (o AdminLTE o mantém aberto depois de navegar) */
  async function abrirMenu(page) {
    if (!(await menuAberto(page))) await botaoMenu(page).click()
    const link = page.getByRole('complementary', { name: 'Menu principal' }).getByRole('link', { name: 'Dashboard' })
    await link.scrollIntoViewIfNeeded()
    await expect(link).toBeInViewport()
  }

  /* Fecha o menu pelo mesmo botão */
  async function fecharMenu(page) {
    if (await menuAberto(page)) {
      await botaoMenu(page).scrollIntoViewIfNeeded()
      await botaoMenu(page).click()
    }
    await expect.poll(() => menuAberto(page)).toBe(false)
  }

  test('fluxo principal em 375 px, com o menu aberto pelo botão', async ({ page }) => {
    await registrar(page, 'celular')
    expect(page.viewportSize().width).toBe(375)
    await semRolagemLateral(page)

    await abrirMenu(page)
    const menu = page.getByRole('complementary', { name: 'Menu principal' })
    await expect(menu.getByRole('link', { name: 'Ciclos de Pagamentos' })).toBeInViewport()
    await semViolacoes(page)

    await menu.getByRole('link', { name: 'Ciclos de Pagamentos' }).click()
    await expect(page.getByRole('heading', { level: 1, name: /Ciclos de Pagamentos/ })).toBeVisible()
    await fecharMenu(page)
    await incluirCiclo(page, { nome: 'Agosto', credito: '3000', debito: '1200,50' })
    await semRolagemLateral(page)
    await semViolacoes(page)

    await abrirMenu(page)
    await conferirPainel(page, /R\$\s3\.000,00/, /R\$\s1\.200,50/, /R\$\s1\.799,50/)
    await fecharMenu(page)
    await semRolagemLateral(page)
    await semViolacoes(page)
  })
})
/* Fim de fluxo.e2e.js */
