import { expect } from '@playwright/test';
import { Entao, Quando } from './fixtures';

Quando('sigo para finalizar a compra', async ({ carrinho }) => {
  await carrinho.irParaFinalizacao();
});

Quando(
  'informo nome {string}, e-mail {string} e CEP {string}',
  async ({ checkout }, nome: string, email: string, cep: string) => {
    await checkout.preencher({ nome, email, cep });
  },
);

Quando('confirmo o pedido', async ({ checkout }) => {
  await checkout.confirmar();
});

Quando('acesso a página de finalização sem itens no carrinho', async ({ page }) => {
  // Uma aba nova começa com o carrinho vazio.
  await page.goto('/checkout');
});

Entao('o pedido é confirmado com um número no formato VZ-000000', async ({ page, checkout }) => {
  await expect(page).toHaveURL(/\/pedido-confirmado$/);
  await expect(checkout.seloConfirmado()).toHaveText('Pedido confirmado');
  await expect(checkout.numeroPedido()).toHaveText(/^VZ-\d{6}$/);
});

Entao('a confirmação agradece a {string}', async ({ checkout }, primeiroNome: string) => {
  await expect(checkout.agradecimento()).toContainText(`Obrigado, ${primeiroNome}.`);
});

Entao('vejo o erro {string} no campo {string}', async ({ checkout }, mensagem: string, campo: string) => {
  await expect(checkout.erroDoCampo(campo)).toHaveText(mensagem);
});

Entao('continuo na página de finalização', async ({ page }) => {
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { name: 'Finalizar compra', level: 1 })).toBeVisible();
});
