# Report de bugs

Entrega VZS-142 (cupom de desconto e frete grátis), versão 2.3.0.
Ambiente: https://verzel-store.qa-test-verzel-store.workers.dev/, em 06/10/2026.

| Bug | Título | Severidade | Critério | Onde ocorre |
|---|---|---|---|---|
| [BUG-01](#bug-01) | Frete de R$ 19,90 é cobrado com subtotal de exatamente R$ 200,00 | Alta | CA06 | API e interface |
| [BUG-02](#bug-02) | API aceita mais de 5 unidades do mesmo produto | Alta | CA10 | API |
| [BUG-03](#bug-03) | Item sem `produtoId` devolve `PRODUTO_NAO_ENCONTRADO` com "undefined" na mensagem | Baixa | Códigos de erro | API |

Severidade usada: **Alta** quando uma regra de negócio da entrega é descumprida e afeta o valor ou o conteúdo do pedido. **Baixa** quando a requisição é recusada como deveria e o problema está só na forma da resposta.

As respostas abaixo são as que a loja devolveu na data do teste. Os prints e a saída dos testes automatizados que falharam estão em [`evidencias.md`](evidencias.md).

---

<a id="bug-01"></a>
## BUG-01 | Frete de R$ 19,90 é cobrado com subtotal de exatamente R$ 200,00

| | |
|---|---|
| Severidade | Alta |
| Critério de aceite | CA06: "O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive." |
| Onde ocorre | `POST /api/carrinho/calcular`, `POST /api/pedidos`, carrinho e finalização da compra |
| Cenários que falham | CT-UI-11 (3 exemplos), CT-UI-13, CT-API-01 (3 exemplos), CT-API-02 (1 exemplo), CT-API-22 |

### Descrição

Quando o subtotal dos produtos é exatamente R$ 200,00, a loja cobra o frete fixo de R$ 19,90. O frete só fica grátis acima de R$ 200,00. O carrinho ainda exibe a mensagem "Faltam R$ 0,00 para o frete grátis.", que contradiz a cobrança.

### Passos para reproduzir na interface

1. Abrir a loja.
2. Clicar duas vezes em "Adicionar ao carrinho" no produto Mochila Urbana 20L (R$ 100,00).
3. Abrir o Carrinho.

| | Subtotal | Frete | Total | Aviso |
|---|---|---|---|---|
| Esperado | R$ 200,00 | Grátis | R$ 200,00 | Nenhum |
| Obtido | R$ 200,00 | R$ 19,90 | R$ 219,90 | "Faltam R$ 0,00 para o frete grátis." |

O mesmo acontece com 4 Garrafas Térmicas 750ml e com 1 Mochila Urbana 20L mais 2 Garrafas Térmicas 750ml.

Print do carrinho, tirado pela automação no cenário CT-UI-11:

![Carrinho com subtotal de R$ 200,00, frete de R$ 19,90 e o aviso "Faltam R$ 0,00 para o frete grátis."](evidencias/CT-UI-11-exemplo-3.png)

Vídeo da reprodução pela automação: [`CT-UI-11-exemplo-3.webm`](evidencias/CT-UI-11-exemplo-3.webm)

### Passos para reproduzir na API

```http
POST /api/carrinho/calcular
Content-Type: application/json

{ "itens": [ { "produtoId": "P005", "quantidade": 2 } ] }
```

Resposta obtida, `200`:

```json
{
  "itens": [
    { "produtoId": "P005", "nome": "Mochila Urbana 20L", "precoUnitario": 100, "quantidade": 2, "total": 200 }
  ],
  "subtotal": 200,
  "desconto": 0,
  "frete": 19.9,
  "freteGratis": false,
  "valorFaltanteFreteGratis": 0,
  "total": 219.9,
  "cupom": null
}
```

Esperado: `"frete": 0`, `"freteGratis": true` e `"total": 200`.

### Comportamento em volta do limite

| Itens | Subtotal | Frete obtido | `freteGratis` | Faltante | Situação |
|---|---|---|---|---|---|
| 1x P004, 1x P005, 1x P008 | 199.9 | 19.9 | false | 0.1 | Correto |
| 2x P005 | 200 | 19.9 | false | 0 | **Incorreto**, o frete deveria ser 0 |
| 3x P008, 1x P001 | 209.9 | 0 | true | 0 | Correto |

### Outros efeitos do mesmo bug

- **Com cupom**: 2x P005 com BEMVINDO10 devolve desconto 20, frete 19.9 e total 199.9. O esperado é frete 0 e total 180 (CA06 e CA08).
- **No pedido**: `POST /api/pedidos` com 2x P005 confirma o pedido (`201`) com frete 19.9 e total 219.9. O cliente fecha a compra pagando o frete que não deveria.

### Impacto

O cliente paga R$ 19,90 a mais sempre que a compra soma exatamente R$ 200,00. Com os preços atuais, o valor é fácil de atingir: 2 mochilas, 4 garrafas, ou 1 mochila e 2 garrafas. A mensagem "Faltam R$ 0,00" confunde, porque diz que não falta nada e mesmo assim cobra o frete.

### Hipótese de causa

O valor faltante sai correto (0), e só a decisão do frete está errada. Isso indica que a comparação do frete usa "maior que 200" no lugar de "maior ou igual a 200".

---

<a id="bug-02"></a>
## BUG-02 | API aceita mais de 5 unidades do mesmo produto

| | |
|---|---|
| Severidade | Alta |
| Critério de aceite | CA10: "Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API." |
| Onde ocorre | `POST /api/carrinho/calcular` e `POST /api/pedidos` |
| Cenários que falham | CT-API-06 (2 exemplos), CT-API-28 (2 exemplos) |

### Descrição

A API calcula o carrinho e confirma o pedido com qualquer quantidade acima de 5. O código `QUANTIDADE_MAXIMA_EXCEDIDA`, previsto na tabela de erros, não é devolvido. A interface respeita o limite: os botões de aumentar e de adicionar ficam desabilitados com 5 unidades (CT-UI-20 e CT-UI-21 passaram).

### Passos para reproduzir no pedido

```http
POST /api/pedidos
Content-Type: application/json

{
  "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310-100" },
  "itens": [ { "produtoId": "P008", "quantidade": 6 } ]
}
```

Resposta obtida, `201`:

```json
{
  "numero": "VZ-392220",
  "criadoEm": "2026-10-06T15:13:22.783Z",
  "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310100" },
  "itens": [
    { "produtoId": "P008", "nome": "Garrafa Térmica 750ml", "precoUnitario": 50, "quantidade": 6, "total": 300 }
  ],
  "subtotal": 300,
  "desconto": 0,
  "frete": 0,
  "freteGratis": true,
  "valorFaltanteFreteGratis": 0,
  "total": 300,
  "cupom": null
}
```

Esperado: `422` com o erro `QUANTIDADE_MAXIMA_EXCEDIDA`.

### Passos para reproduzir no cálculo

```http
POST /api/carrinho/calcular
Content-Type: application/json

{ "itens": [ { "produtoId": "P008", "quantidade": 6 } ] }
```

Resposta obtida: `200`, com `"quantidade": 6` e `"total": 300`. Esperado: `422` com o erro `QUANTIDADE_MAXIMA_EXCEDIDA`.

### Quantidades testadas

| Quantidade | Cálculo | Pedido | Situação |
|---|---|---|---|
| 5 | 200 | 201 | Correto |
| 6 | 200 | 201 | **Incorreto**, deveria ser 422 |
| 10 | 200 | 201 | **Incorreto**, deveria ser 422 |
| 100 | 200, total 2990 | não testado | **Incorreto**, deveria ser 422 |

### Impacto

O limite existe só na interface. Qualquer chamada direta à API fecha pedidos com quantidade ilimitada do mesmo produto, o que descumpre a regra de negócio da entrega.

---

<a id="bug-03"></a>
## BUG-03 | Item sem `produtoId` devolve `PRODUTO_NAO_ENCONTRADO` com "undefined" na mensagem

| | |
|---|---|
| Severidade | Baixa |
| Referência | Tabela "Códigos de erro": `ITEM_INVALIDO` quando "um item não é um objeto com produtoId e quantidade" |
| Onde ocorre | `POST /api/carrinho/calcular` |
| Cenário que falha | CT-API-48 |

### Descrição

Um item enviado sem o campo `produtoId` é recusado, o que está certo, mas com o código de produto inexistente e uma mensagem que expõe o valor interno "undefined".

### Passos para reproduzir

```http
POST /api/carrinho/calcular
Content-Type: application/json

{ "itens": [ { "quantidade": 1 } ] }
```

Resposta obtida, `422`:

```json
{
  "erro": {
    "codigo": "PRODUTO_NAO_ENCONTRADO",
    "mensagem": "Produto undefined não encontrado.",
    "campo": "itens[0].produtoId"
  }
}
```

Esperado: `422` com o código `ITEM_INVALIDO`, como acontece quando o item não é um objeto:

```json
{
  "erro": {
    "codigo": "ITEM_INVALIDO",
    "mensagem": "Cada item deve ser um objeto com produtoId e quantidade.",
    "campo": "itens[0]"
  }
}
```

### Impacto

Quem integra com a API recebe um erro que aponta para o catálogo de produtos, quando o problema é o formato do item. A requisição é recusada de qualquer forma, por isso a severidade é baixa.

### Observação

O caso do item sem `quantidade` devolve `QUANTIDADE_INVALIDA` e foi tratado como ambiguidade, não como bug. Ver [`ambiguidades.md`](ambiguidades.md), item 6.

---

## Observações que não foram abertas como bug

Comportamentos que a documentação não cobre. Estão detalhados em [`execucao-testes.md`](execucao-testes.md), na seção de testes exploratórios, e em [`ambiguidades.md`](ambiguidades.md).

- O cupom continua aplicado depois de remover o último item pelo botão "Remover". Com "Esvaziar carrinho" ele é removido (EXP-03).
- Cupom vazio e cupom só com espaços têm tratamentos diferentes na API (EXP-05).
- Os erros 400, 404 e 405 não trazem o atributo `campo` (ambiguidade 7).
