import { expect } from '@playwright/test';
import { DataTable } from 'playwright-bdd';
import { buscarProduto, CLIENTE_VALIDO, comEspacos, itensParaApi } from '../support/catalogo';
import { Entao, Quando } from './fixtures';

const CALCULO = '/api/carrinho/calcular';
const PEDIDOS = '/api/pedidos';
const JSON_HEADERS = { 'content-type': 'application/json' };

/** Campos do resumo que o cálculo do carrinho e o pedido devolvem iguais. */
const CAMPOS_RESUMO = ['itens', 'subtotal', 'desconto', 'frete', 'freteGratis', 'valorFaltanteFreteGratis', 'total', 'cupom'];

function temNoMaximoDuasCasas(valor: number): boolean {
  return Number.isFinite(valor) && Math.round(valor * 100) / 100 === valor;
}

// ----- Cálculo do carrinho -----

Quando('calculo o carrinho com {string}', async ({ request, respostaApi }, itens: string) => {
  await respostaApi.guardar(await request.post(CALCULO, { data: { itens: itensParaApi(itens) } }));
});

Quando(
  'calculo o carrinho com {string} e o cupom {string}',
  async ({ request, respostaApi }, itens: string, cupom: string) => {
    await respostaApi.guardar(
      await request.post(CALCULO, { data: { itens: itensParaApi(itens), cupom: comEspacos(cupom) } }),
    );
  },
);

// A quantidade chega como texto do cenário e é enviada como JSON: 6, -1, 1.5, null, "2".
Quando(
  'calculo o carrinho com o produto {string} na quantidade {}',
  async ({ request, respostaApi }, produtoId: string, quantidade: string) => {
    await respostaApi.guardar(
      await request.post(CALCULO, { data: { itens: [{ produtoId, quantidade: JSON.parse(quantidade) }] } }),
    );
  },
);

// ----- Pedidos -----

Quando('envio um pedido com {string}', async ({ request, respostaApi }, itens: string) => {
  await respostaApi.guardar(
    await request.post(PEDIDOS, { data: { cliente: CLIENTE_VALIDO, itens: itensParaApi(itens) } }),
  );
});

Quando(
  'envio um pedido com {string} e o cupom {string}',
  async ({ request, respostaApi }, itens: string, cupom: string) => {
    await respostaApi.guardar(
      await request.post(PEDIDOS, {
        data: { cliente: CLIENTE_VALIDO, itens: itensParaApi(itens), cupom: comEspacos(cupom) },
      }),
    );
  },
);

Quando(
  'envio um pedido com {string} alterando o campo {string} do cliente para {string}',
  async ({ request, respostaApi }, itens: string, campo: string, valor: string) => {
    const cliente = { ...CLIENTE_VALIDO, [campo]: valor };
    await respostaApi.guardar(await request.post(PEDIDOS, { data: { cliente, itens: itensParaApi(itens) } }));
  },
);

Quando(
  'envio um pedido com {string} e o cliente:',
  async ({ request, respostaApi }, itens: string, tabela: DataTable) => {
    const cliente = tabela.rowsHash();
    await respostaApi.guardar(await request.post(PEDIDOS, { data: { cliente, itens: itensParaApi(itens) } }));
  },
);

Quando(
  'envio um pedido com o produto {string} na quantidade {}',
  async ({ request, respostaApi }, produtoId: string, quantidade: string) => {
    await respostaApi.guardar(
      await request.post(PEDIDOS, {
        data: { cliente: CLIENTE_VALIDO, itens: [{ produtoId, quantidade: JSON.parse(quantidade) }] },
      }),
    );
  },
);

// ----- Requisições livres -----

Quando('envio uma requisição {word} para {string}', async ({ request, respostaApi }, metodo: string, rota: string) => {
  await respostaApi.guardar(await request.fetch(rota, { method: metodo, headers: JSON_HEADERS }));
});

Quando(
  'envio uma requisição {word} para {string} com o corpo:',
  async ({ request, respostaApi }, metodo: string, rota: string, corpo: string) => {
    // Buffer: o texto vai exatamente como está no cenário, mesmo quando é um JSON malformado.
    await respostaApi.guardar(
      await request.fetch(rota, { method: metodo, headers: JSON_HEADERS, data: Buffer.from(corpo, 'utf8') }),
    );
  },
);

// ----- Respostas -----

Entao('o status da resposta é {int}', async ({ respostaApi }, status: number) => {
  expect(respostaApi.status, `Corpo recebido: ${JSON.stringify(respostaApi.corpo)}`).toBe(status);
});

Entao(
  'o resumo da resposta tem subtotal {float}, desconto {float}, frete {float}, faltante {float} e total {float}',
  async ({ respostaApi }, subtotal: number, desconto: number, frete: number, faltante: number, total: number) => {
    const { corpo } = respostaApi;
    // soft: confere todos os valores e mostra todos os que divergirem
    expect.soft(corpo.subtotal, 'subtotal').toBe(subtotal);
    expect.soft(corpo.desconto, 'desconto').toBe(desconto);
    expect.soft(corpo.frete, 'frete').toBe(frete);
    expect.soft(corpo.valorFaltanteFreteGratis, 'valorFaltanteFreteGratis').toBe(faltante);
    expect.soft(corpo.total, 'total').toBe(total);
  },
);

Entao('o indicador de frete grátis é {string}', async ({ respostaApi }, simOuNao: string) => {
  expect(respostaApi.corpo.freteGratis, 'freteGratis').toBe(simOuNao === 'sim');
});

Entao('todos os valores monetários têm no máximo 2 casas decimais', async ({ respostaApi }) => {
  const { corpo } = respostaApi;
  const valores: Record<string, number> = {
    subtotal: corpo.subtotal,
    desconto: corpo.desconto,
    frete: corpo.frete,
    valorFaltanteFreteGratis: corpo.valorFaltanteFreteGratis,
    total: corpo.total,
  };
  corpo.itens.forEach((item: any, indice: number) => {
    valores[`itens[${indice}].precoUnitario`] = item.precoUnitario;
    valores[`itens[${indice}].total`] = item.total;
  });
  for (const [campo, valor] of Object.entries(valores)) {
    expect.soft(temNoMaximoDuasCasas(valor), `${campo} = ${valor}`).toBe(true);
  }
});

Entao('o total de cada item é o preço unitário vezes a quantidade', async ({ respostaApi }) => {
  for (const item of respostaApi.corpo.itens) {
    const preco = buscarProduto(item.produtoId).preco;
    expect.soft(item.precoUnitario, `${item.produtoId} precoUnitario`).toBe(preco);
    expect.soft(item.total, `${item.produtoId} total`).toBe(Math.round(preco * item.quantidade * 100) / 100);
  }
});

Entao('o cupom da resposta está aplicado com o código {string}', async ({ respostaApi }, codigo: string) => {
  expect(respostaApi.corpo.cupom).toMatchObject({ codigo, aplicado: true });
});

Entao(
  'o cupom da resposta não foi aplicado, com a mensagem {string}',
  async ({ respostaApi }, mensagem: string) => {
    expect(respostaApi.corpo.cupom).toMatchObject({ aplicado: false, mensagem });
  },
);

// ----- Erros -----

Entao('o código de erro é {string}', async ({ respostaApi }, codigo: string) => {
  expect(respostaApi.corpo?.erro?.codigo, `Corpo recebido: ${JSON.stringify(respostaApi.corpo)}`).toBe(codigo);
});

Entao('o erro aponta o campo {string}', async ({ respostaApi }, campo: string) => {
  expect(respostaApi.corpo.erro.campo).toBe(campo);
});

Entao('o erro lista os campos {string}', async ({ respostaApi }, campos: string) => {
  const esperados = campos.split(',').map((campo) => campo.trim());
  const recebidos = (respostaApi.corpo.erro.campos ?? []).map((detalhe: any) => detalhe.campo);
  expect(recebidos).toEqual(esperados);
});

Entao('o erro traz código e mensagem', async ({ respostaApi }) => {
  const erro = respostaApi.corpo?.erro;
  expect(erro, `Corpo recebido: ${JSON.stringify(respostaApi.corpo)}`).toBeTruthy();
  expect(erro.codigo).toMatch(/^[A-Z_]+$/);
  expect(typeof erro.mensagem).toBe('string');
  expect(erro.mensagem.length).toBeGreaterThan(0);
});

// ----- Pedido -----

Entao('o número do pedido segue o formato VZ-000000', async ({ respostaApi }) => {
  expect(respostaApi.corpo.numero).toMatch(/^VZ-\d{6}$/);
});

Entao('o CEP do cliente é devolvido como {string}', async ({ respostaApi }, cep: string) => {
  expect(respostaApi.corpo.cliente.cep).toBe(cep);
});

Entao(
  'o resumo do pedido é igual ao do cálculo do carrinho para {string} e o cupom {string}',
  async ({ request, respostaApi }, itens: string, cupom: string) => {
    const calculo = await (await request.post(CALCULO, { data: { itens: itensParaApi(itens), cupom } })).json();
    for (const campo of CAMPOS_RESUMO) {
      expect.soft(respostaApi.corpo[campo], campo).toEqual(calculo[campo]);
    }
  },
);

// ----- Produtos -----

Entao('a resposta lista {int} produtos', async ({ respostaApi }, quantidade: number) => {
  expect(respostaApi.corpo).toHaveLength(quantidade);
});

Entao('os produtos e preços são:', async ({ respostaApi }, tabela: DataTable) => {
  const esperados = tabela.hashes().map((linha) => ({ id: linha.id, nome: linha.nome, preco: Number(linha.preco) }));
  const recebidos = respostaApi.corpo.map((p: any) => ({ id: p.id, nome: p.nome, preco: p.preco }));
  expect(recebidos).toEqual(esperados);
});

Entao(
  'a resposta traz o produto {string} com o preço {float}',
  async ({ respostaApi }, nome: string, preco: number) => {
    expect(respostaApi.corpo).toMatchObject({ nome, preco });
  },
);
