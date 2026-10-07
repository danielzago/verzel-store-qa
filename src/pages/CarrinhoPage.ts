import { expect, type Locator, type Page } from '@playwright/test';

export interface ValoresResumo {
  subtotal: string;
  desconto: string;
  frete: string;
  total: string;
}

/**
 * Página do carrinho. O bloco "Resumo do pedido" também aparece na finalização
 * e na confirmação, então os localizadores do resumo valem para as três telas.
 */
export class CarrinhoPage {
  constructor(private readonly page: Page) {}

  // ----- Itens -----

  linhaItem(nomeProduto: string): Locator {
    return this.page
      .locator('.item-carrinho')
      .filter({ has: this.page.getByRole('heading', { name: nomeProduto, exact: true }) });
  }

  quantidade(nomeProduto: string): Locator {
    return this.page.getByRole('group', { name: `Quantidade de ${nomeProduto}` }).locator('output');
  }

  botaoAumentar(nomeProduto: string): Locator {
    return this.page.getByRole('button', { name: `Aumentar quantidade de ${nomeProduto}` });
  }

  botaoDiminuir(nomeProduto: string): Locator {
    return this.page.getByRole('button', { name: `Diminuir quantidade de ${nomeProduto}` });
  }

  totalDoItem(nomeProduto: string): Locator {
    return this.linhaItem(nomeProduto).locator('.item-total');
  }

  avisoLimite(nomeProduto: string): Locator {
    return this.linhaItem(nomeProduto).locator('.item-limite');
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

  mensagemCupom(): Locator {
    return this.page.locator('#mensagem-cupom');
  }

  cupomAplicado(): Locator {
    return this.page.locator('.cupom-aplicado');
  }

  botaoRemoverCupom(): Locator {
    return this.page.getByRole('button', { name: 'Remover cupom' });
  }

  async aplicarCupom(codigo: string) {
    await this.campoCupom().fill(codigo);
    await this.page.getByRole('button', { name: 'Aplicar cupom' }).click();
  }

  // ----- Resumo do pedido -----

  resumo(): Locator {
    return this.page.locator('section.resumo');
  }

  valor(nome: keyof ValoresResumo): Locator {
    return this.resumo().locator(`[data-valor="${nome}"]`);
  }

  avisoFrete(): Locator {
    return this.page.locator('.aviso-frete');
  }

  /** Espera a API terminar o cálculo antes de conferir os valores. */
  async esperarCalculo() {
    await expect(this.resumo()).toBeVisible();
    await expect(this.page.locator('.coluna-resumo[aria-busy="true"]')).toHaveCount(0);
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
