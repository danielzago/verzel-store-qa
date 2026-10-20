import { expect, type Locator, type Page } from '@playwright/test';

export interface ValoresResumo {
  subtotal: string;
  desconto: string;
  frete: string;
  total: string;
}

/**
 * Página do carrinho. O bloco do resumo também aparece na finalização
 * e na confirmação, então os localizadores do resumo valem para as três telas.
 *
 * Localizadores: papel e nome acessível (getByRole, getByLabel) e texto visível,
 * como o cliente enxerga a tela. Os valores do resumo usam getByTestId com o
 * atributo data-valor (configurado em playwright.config.ts).
 */
export class CarrinhoPage {
  constructor(private readonly page: Page) {}

  // ----- Itens -----

  /** Item da lista do carrinho, localizado pelo título com o nome do produto. */
  linhaItem(nomeProduto: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ has: this.page.getByRole('heading', { name: nomeProduto, exact: true }) });
  }

  quantidade(nomeProduto: string): Locator {
    // O número fica num <output>, que tem o papel "status".
    return this.page.getByRole('group', { name: `Quantidade de ${nomeProduto}` }).getByRole('status');
  }

  botaoAumentar(nomeProduto: string): Locator {
    return this.page.getByRole('button', { name: `Aumentar quantidade de ${nomeProduto}` });
  }

  botaoDiminuir(nomeProduto: string): Locator {
    return this.page.getByRole('button', { name: `Diminuir quantidade de ${nomeProduto}` });
  }

  /** Valor total do item: o texto em reais que não é o preço unitário ("R$ 50,00 cada"). */
  totalDoItem(nomeProduto: string): Locator {
    return this.linhaItem(nomeProduto).getByText(/^R\$\s*[\d.]+,\d{2}$/);
  }

  avisoLimite(nomeProduto: string): Locator {
    return this.linhaItem(nomeProduto).getByText(/^Limite de \d+ unidades por produto\.$/);
  }

  /** Clica em + ou - uma unidade por vez até chegar na quantidade desejada. */
  async alterarQuantidade(nomeProduto: string, desejada: number) {
    let atual = Number(await this.quantidade(nomeProduto).innerText());
    while (atual !== desejada) {
      if (atual < desejada) {
        await this.botaoAumentar(nomeProduto).click();
        atual++;
      } else {
        await this.botaoDiminuir(nomeProduto).click();
        atual--;
      }
      await expect(this.quantidade(nomeProduto)).toHaveText(String(atual));
    }
  }

  async remover(nomeProduto: string) {
    await this.page.getByRole('button', { name: `Remover ${nomeProduto} do carrinho` }).click();
    await expect(this.linhaItem(nomeProduto)).toHaveCount(0);
  }

  async esvaziar() {
    await this.page.getByRole('button', { name: 'Esvaziar carrinho' }).click();
  }

  tituloCarrinhoVazio(): Locator {
    return this.page.getByRole('heading', { name: 'Seu carrinho está vazio' });
  }

  // ----- Cupom -----

  campoCupom(): Locator {
    return this.page.getByLabel('Cupom de desconto');
  }

  /** A mensagem de erro do cupom tem o papel "alert", lido em voz alta pelo leitor de tela. */
  mensagemCupom(): Locator {
    return this.page.getByRole('alert');
  }

  cupomAplicado(): Locator {
    return this.page.getByText(/^Cupom .+ aplicado\.$/);
  }

  botaoRemoverCupom(): Locator {
    return this.page.getByRole('button', { name: 'Remover cupom' });
  }

  async aplicarCupom(codigo: string) {
    await this.campoCupom().fill(codigo);
    await this.page.getByRole('button', { name: 'Aplicar cupom' }).click();
    // Espera a loja responder: o cupom aparece como aplicado ou surge a mensagem de erro.
    await expect(this.cupomAplicado().or(this.mensagemCupom())).toBeVisible();
  }

  // ----- Resumo do pedido -----

  /** Seção nomeada pelo título: "Resumo do pedido" no carrinho e na finalização, "Itens do pedido" na confirmação. */
  resumo(): Locator {
    return this.page.getByRole('region', { name: /^(Resumo|Itens) do pedido$/ });
  }

  valor(nome: keyof ValoresResumo): Locator {
    return this.resumo().getByTestId(nome);
  }

  avisoFrete(): Locator {
    return this.resumo().getByText(/para o frete grátis\.$/);
  }

  /** Espera a API terminar o cálculo: a tela marca a coluna com aria-busy enquanto calcula. */
  async esperarCalculo() {
    await expect(this.resumo()).toBeVisible();
    await expect(this.page.locator('[aria-busy="true"]')).toHaveCount(0);
  }

  async conferirResumo(esperado: ValoresResumo) {
    await this.esperarCalculo();
    // soft: confere os quatro valores e mostra todos os que divergirem, não só o primeiro
    await expect.soft(this.valor('subtotal'), 'Subtotal').toHaveText(esperado.subtotal);
    await expect.soft(this.valor('desconto'), 'Desconto').toHaveText(esperado.desconto);
    await expect.soft(this.valor('frete'), 'Frete').toHaveText(esperado.frete);
    await expect.soft(this.valor('total'), 'Total').toHaveText(esperado.total);
  }

  async irParaFinalizacao() {
    await this.page.getByRole('link', { name: 'Finalizar compra' }).click();
    await expect(this.page.getByRole('heading', { name: 'Finalizar compra', level: 1 })).toBeVisible();
  }
}
