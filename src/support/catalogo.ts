// Massa de dados da documentação (card VZS-142, seção "Dados para teste").

export interface Produto {
  id: string;
  nome: string;
  preco: number;
}

export const PRODUTOS: Produto[] = [
  { id: 'P001', nome: 'Camiseta Essencial', preco: 59.9 },
  { id: 'P002', nome: 'Calça Jeans Slim', preco: 139.9 },
  { id: 'P003', nome: 'Tênis Casual Urbano', preco: 189.9 },
  { id: 'P004', nome: 'Boné Aba Curva', preco: 49.9 },
  { id: 'P005', nome: 'Mochila Urbana 20L', preco: 100 },
  { id: 'P006', nome: 'Kit 3 Pares de Meias', preco: 29.9 },
  { id: 'P007', nome: 'Jaqueta Corta-Vento', preco: 229.9 },
  { id: 'P008', nome: 'Garrafa Térmica 750ml', preco: 50 },
];

export const CLIENTE_VALIDO = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  cep: '01310-100',
};

/** Encontra um produto pelo id (P005) ou pelo nome (Mochila Urbana 20L). */
export function buscarProduto(idOuNome: string): Produto {
  const produto = PRODUTOS.find((p) => p.id === idOuNome || p.nome === idOuNome);
  if (!produto) {
    throw new Error(`Produto "${idOuNome}" não existe na massa de dados do teste.`);
  }
  return produto;
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

/**
 * Converte o texto usado nos cenários em itens de carrinho.
 * Exemplo: "2x Mochila Urbana 20L, 1x P006"
 */
export function lerItens(texto: string): ItemCarrinho[] {
  return texto.split(',').map((parte) => {
    const achou = parte.trim().match(/^(\d+)x\s+(.+)$/);
    if (!achou) {
      throw new Error(`Item "${parte.trim()}" fora do formato "<quantidade>x <produto>".`);
    }
    return { quantidade: Number(achou[1]), produto: buscarProduto(achou[2].trim()) };
  });
}

/** Itens no formato que a API espera. */
export function itensParaApi(texto: string) {
  return lerItens(texto).map((item) => ({
    produtoId: item.produto.id,
    quantidade: item.quantidade,
  }));
}

/**
 * O Gherkin descarta espaços nas pontas das células de Exemplos.
 * Para testar espaços digitados, os cenários usam o marcador [espaço].
 */
export function comEspacos(texto: string): string {
  return texto.replaceAll('[espaço]', ' ');
}

/** Formata um número como a loja exibe: 109.9 vira "R$ 109,90". */
export function emReais(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(valor)
    .replace(/ /g, ' ');
}
