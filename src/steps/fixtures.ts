import type { APIRequestContext, APIResponse } from '@playwright/test';
import { createBdd, test as base } from 'playwright-bdd';
import { CarrinhoPage } from '../pages/CarrinhoPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { VitrinePage } from '../pages/VitrinePage';

type CorpoRequisicao = object | string | Buffer;

/**
 * Envia as requisições de API e guarda a última resposta para os passos "Então" conferirem.
 *
 * Evidência: toda requisição passa por enviar(), que anexa ao relatório o que foi
 * enviado e o que voltou (status e corpo). Assim todo teste de API, aprovado ou não,
 * tem a própria evidência no relatório do Playwright e no do Cucumber.
 */
export class RespostaApi {
  private resposta?: APIResponse;
  corpo: any;

  constructor(private readonly request: APIRequestContext) {}

  async enviar(metodo: string, rota: string, corpo?: CorpoRequisicao) {
    const headers = typeof corpo === 'object' && !Buffer.isBuffer(corpo) ? undefined : { 'content-type': 'application/json' };
    const resposta = await this.request.fetch(rota, { method: metodo, headers, data: corpo });
    await this.guardar(resposta, metodo, rota, corpo);
  }

  private async guardar(resposta: APIResponse, metodo: string, rota: string, corpo?: CorpoRequisicao) {
    this.resposta = resposta;
    const texto = await resposta.text();
    try {
      this.corpo = JSON.parse(texto);
    } catch {
      this.corpo = null;
    }

    const requisicao = { metodo, rota, corpo: Buffer.isBuffer(corpo) ? corpo.toString('utf8') : corpo ?? null };
    await base.info().attach(`requisicao ${metodo} ${rota}`, {
      body: JSON.stringify(requisicao, null, 2),
      contentType: 'application/json',
    });
    await base.info().attach(`resposta ${resposta.status()}`, {
      body: JSON.stringify({ status: resposta.status(), corpo: this.corpo ?? texto }, null, 2),
      contentType: 'application/json',
    });
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
  respostaApi: async ({ request }, use) => use(new RespostaApi(request)),
});

// Dado, Quando e Então para os passos ficarem na mesma língua dos .feature
export const { Given: Dado, When: Quando, Then: Entao } = createBdd(test);
