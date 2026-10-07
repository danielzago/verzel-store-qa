import { expect } from '@playwright/test';
import { comEspacos } from '../support/catalogo';
import { Entao, Quando } from './fixtures';

Quando('aplico o cupom {string}', async ({ carrinho }, codigo: string) => {
  await carrinho.aplicarCupom(comEspacos(codigo));
});

Quando('removo o cupom', async ({ carrinho }) => {
  await carrinho.botaoRemoverCupom().click();
});

Entao('o cupom {string} aparece como aplicado', async ({ carrinho }, codigo: string) => {
  await expect(carrinho.cupomAplicado()).toContainText(`Cupom ${codigo} aplicado.`);
});

Entao('vejo a mensagem de cupom {string}', async ({ carrinho }, mensagem: string) => {
  await expect(carrinho.mensagemCupom()).toHaveText(mensagem);
});

Entao('nenhum cupom está aplicado', async ({ carrinho }) => {
  await expect(carrinho.cupomAplicado()).toHaveCount(0);
  await expect(carrinho.campoCupom()).toBeVisible();
});

Entao('não é possível informar outro cupom', async ({ carrinho }) => {
  await expect(carrinho.campoCupom()).toHaveCount(0);
  await expect(carrinho.botaoRemoverCupom()).toBeVisible();
});
