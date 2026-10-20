import { type Locator, type Page } from '@playwright/test';

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

  /**
   * Campo do formulário pelo rótulo. A mensagem de erro fica ligada ao campo
   * por aria-describedby, então é conferida como descrição acessível do campo.
   */
  campo(rotulo: string): Locator {
    return this.page.getByLabel(rotulo, { exact: true });
  }

  // ----- Pedido confirmado -----

  seloConfirmado(): Locator {
    return this.page.getByText('Pedido confirmado', { exact: true });
  }

  /** Título principal da confirmação: "Pedido VZ-000000". */
  tituloPedido(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  agradecimento(): Locator {
    return this.page.getByText(/^Obrigado, /);
  }
}
