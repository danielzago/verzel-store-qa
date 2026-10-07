import { expect } from '@playwright/test';
import { emReais, lerItens } from '../support/catalogo';
import { Dado, Entao, Quando } from './fixtures';

// ----- Montagem do carrinho -----

Dado('que estou na vitrine', async ({ vitrine }) => {
  await vitrine.abrir();
});

Dado('que o carrinho contém {string}', async ({ vitrine, carrinho }, itens: string) => {
  await vitrine.abrir();
  for (const item of lerItens(itens)) {
    await vitrine.adicionar(item.produto.nome, item.quantidade);
  }
  await vitrine.irParaCarrinho();
  await carrinho.esperarCalculo();
});

Quando('adiciono {int} unidade(s) de {string} pela vitrine', async ({ vitrine }, quantidade: number, produto: string) => {
  await vitrine.adicionar(produto, quantidade);
});

Quando('visualizo o resumo do pedido', async ({ carrinho }) => {
  await carrinho.esperarCalculo();
});

// ----- Ações no carrinho -----

Quando('aumento a quantidade de {string} para {int}', async ({ carrinho }, produto: string, quantidade: number) => {
  await carrinho.alterarQuantidade(produto, quantidade);
});

Quando('diminuo a quantidade de {string} para {int}', async ({ carrinho }, produto: string, quantidade: number) => {
  await carrinho.alterarQuantidade(produto, quantidade);
});

Quando('removo {string} do carrinho', async ({ carrinho }, produto: string) => {
  await carrinho.remover(produto);
});

Quando('esvazio o carrinho', async ({ carrinho }) => {
  await carrinho.esvaziar();
});

// ----- Resumo do pedido -----

Entao(
  'o resumo exibe subtotal {string}, desconto {string}, frete {string} e total {string}',
  async ({ carrinho }, subtotal: string, desconto: string, frete: string, total: string) => {
    await carrinho.conferirResumo({ subtotal, desconto, frete, total });
  },
);

Entao('o carrinho informa {string}', async ({ carrinho }, mensagem: string) => {
  await expect(carrinho.avisoFrete()).toHaveText(mensagem);
});

Entao('o carrinho não exibe aviso de valor faltante', async ({ carrinho }) => {
  await expect(carrinho.avisoFrete()).toHaveCount(0);
});

Entao('os valores do resumo na tela são iguais aos calculados pela API', async ({ page, carrinho }) => {
  // O carrinho fica no sessionStorage da aba. Os mesmos itens e cupom são enviados à API.
  const itens = await page.evaluate(() => JSON.parse(sessionStorage.getItem('verzel-store:itens') ?? '[]'));
  const cupom = await page.evaluate(() => JSON.parse(sessionStorage.getItem('verzel-store:cupom') ?? 'null'));
  const resposta = await page.request.post('/api/carrinho/calcular', {
    data: { itens, cupom: cupom ?? undefined },
  });
  expect(resposta.status()).toBe(200);
  const calculo = await resposta.json();

  await carrinho.conferirResumo({
    subtotal: emReais(calculo.subtotal),
    desconto: calculo.desconto > 0 ? `- ${emReais(calculo.desconto)}` : emReais(0),
    frete: calculo.frete === 0 ? 'Grátis' : emReais(calculo.frete),
    total: emReais(calculo.total),
  });
});

// ----- Quantidade e limite -----

Entao('a quantidade de {string} é {int}', async ({ carrinho }, produto: string, quantidade: number) => {
  await expect(carrinho.quantidade(produto)).toHaveText(String(quantidade));
});

Entao('o total do item {string} é {string}', async ({ carrinho }, produto: string, total: string) => {
  await expect(carrinho.totalDoItem(produto)).toHaveText(total);
});

Entao('o botão de aumentar a quantidade de {string} está desabilitado', async ({ carrinho }, produto: string) => {
  await expect(carrinho.botaoAumentar(produto)).toBeDisabled();
});

Entao('o botão de diminuir a quantidade de {string} está desabilitado', async ({ carrinho }, produto: string) => {
  await expect(carrinho.botaoDiminuir(produto)).toBeDisabled();
});

Entao('o carrinho avisa o limite de unidades para {string}', async ({ carrinho }, produto: string) => {
  await expect(carrinho.avisoLimite(produto)).toHaveText('Limite de 5 unidades por produto.');
});

Entao('a vitrine informa {string} para {string}', async ({ vitrine }, mensagem: string, produto: string) => {
  await expect(vitrine.aviso(produto)).toHaveText(mensagem);
});

Entao('o botão de adicionar {string} está desabilitado', async ({ vitrine }, produto: string) => {
  await expect(vitrine.botaoAdicionar(produto)).toBeDisabled();
});

Entao('o contador do carrinho mostra {int}', async ({ vitrine }, quantidade: number) => {
  await expect(vitrine.contadorCarrinho()).toHaveText(String(quantidade));
});

Entao('o carrinho está vazio', async ({ page, carrinho }) => {
  await expect(page).toHaveURL(/\/carrinho$/);
  await expect(carrinho.tituloCarrinhoVazio()).toBeVisible();
  await expect(carrinho.resumo()).toHaveCount(0);
});
