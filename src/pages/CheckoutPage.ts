import { type Locator, type Page } from '@playwright/test';

/** Rótulo do campo na tela e o nome usado nos ids do formulário. */
const CAMPOS: Record<string, string> = {
  'Nome completo': 'nome',
  'E-mail': 'email',
  CEP: 'cep',
};

/** Página de finalização da compra e página de pedido confirmado. */
export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async preencher(dados: { nome: string; email: string; cep: string }) {
    await this.page.getByLabel('Nome completo').fill(dados.nome);
    await this.page.getByLabel('E-mail').fill(dados.email);
    await this.page.getByLabel('CEP', { exact: true }).fill(dados.cep);
  }

  async confirmar() {
    await this.page.getByRole('button', { name: 'Confirmar pedido' }).click();
  }

  erroDoCampo(rotulo: string): Locator {
    const campo = CAMPOS[rotulo];
    if (!campo) {
      throw new Error(`Campo "${rotulo}" não existe no formulário. Use: ${Object.keys(CAMPOS).join(', ')}.`);
    }
    return this.page.locator(`#campo-${campo}-erro`);
  }

  // ----- Pedido confirmado -----

  seloConfirmado(): Locator {
    return this.page.locator('.confirmacao-selo');
  }

  numeroPedido(): Locator {
    return this.page.locator('.numero-pedido');
  }

  agradecimento(): Locator {
    return this.page.locator('.confirmacao').getByText(/^Obrigado, /);
  }
}
