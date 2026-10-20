import { expect, type Locator, type Page } from '@playwright/test';

/** Página inicial da loja, com a lista de produtos. */
export class VitrinePage {
  constructor(private readonly page: Page) {}

  async abrir() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Produtos', level: 2 })).toBeVisible();
    await expect(this.page.getByRole('article').first()).toBeVisible();
  }

  /** Cartão do produto, localizado pelo título com o nome do produto. */
  cartao(nomeProduto: string): Locator {
    return this.page
      .getByRole('article')
      .filter({ has: this.page.getByRole('heading', { name: nomeProduto, exact: true }) });
  }

  botaoAdicionar(nomeProduto: string): Locator {
    return this.cartao(nomeProduto).getByRole('button', { name: 'Adicionar ao carrinho' });
  }

  /** Texto abaixo do botão: "2 no carrinho" ou "Limite de 5 unidades atingido." */
  aviso(nomeProduto: string): Locator {
    return this.cartao(nomeProduto).getByText(/^\d+ no carrinho$|^Limite de \d+ unidades atingido\.$/);
  }

  /** Número no link do carrinho, que tem o nome acessível "N itens no carrinho". */
  contadorCarrinho(): Locator {
    return this.page.getByRole('navigation', { name: 'Principal' }).getByLabel(/itens no carrinho$/);
  }

  /** Clica em "Adicionar ao carrinho" uma vez por unidade, como um cliente faria. */
  async adicionar(nomeProduto: string, quantidade: number) {
    // Se o produto já estiver no carrinho, continua a contagem de onde parou.
    const aviso = this.aviso(nomeProduto);
    const jaNoCarrinho = (await aviso.count()) > 0 ? Number.parseInt(await aviso.innerText(), 10) || 0 : 0;
    for (let unidade = jaNoCarrinho + 1; unidade <= jaNoCarrinho + quantidade; unidade++) {
      await this.botaoAdicionar(nomeProduto).click();
      const esperado = unidade >= 5 ? 'Limite de 5 unidades atingido.' : `${unidade} no carrinho`;
      await expect(this.aviso(nomeProduto)).toHaveText(esperado);
    }
  }

  async irParaCarrinho() {
    await this.page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: /Carrinho/ }).click();
    await expect(this.page).toHaveURL(/\/carrinho$/);
  }
}
