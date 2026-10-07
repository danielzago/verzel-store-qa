import type { APIResponse } from '@playwright/test';
import { createBdd, test as base } from 'playwright-bdd';
import { CarrinhoPage } from '../pages/CarrinhoPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { VitrinePage } from '../pages/VitrinePage';

/** Guarda a última resposta da API para os passos "Então" conferirem. */
export class RespostaApi {
  private resposta?: APIResponse;
  corpo: any;

  async guardar(resposta: APIResponse) {
    this.resposta = resposta;
    this.corpo = await resposta.json().catch(() => null);
  }

  get status(): number {
    if (!this.resposta) {
      throw new Error('Nenhuma requisição foi enviada antes deste passo.');
    }
    return this.resposta.status();
  }
}

type Fixtures = {
  vitrine: VitrinePage;
  carrinho: CarrinhoPage;
  checkout: CheckoutPage;
  respostaApi: RespostaApi;
};

export const test = base.extend<Fixtures>({
  vitrine: async ({ page }, use) => use(new VitrinePage(page)),
  carrinho: async ({ page }, use) => use(new CarrinhoPage(page)),
  checkout: async ({ page }, use) => use(new CheckoutPage(page)),
  respostaApi: async ({}, use) => use(new RespostaApi()),
});

// Dado, Quando e Então para os passos ficarem na mesma língua dos .feature
export const { Given: Dado, When: Quando, Then: Entao } = createBdd(test);
