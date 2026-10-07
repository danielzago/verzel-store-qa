# language: pt
@api @contrato
Funcionalidade: Catálogo de produtos e códigos de erro da API
  Confere os endpoints de consulta e a tabela "Códigos de erro" da documentação.

  Cenário: CT-API-40 A lista de produtos traz os 8 produtos e os preços da documentação
    Quando envio uma requisição GET para "/api/produtos"
    Então o status da resposta é 200
    E a resposta lista 8 produtos
    E os produtos e preços são:
      | id   | nome                  | preco |
      | P001 | Camiseta Essencial    | 59.9  |
      | P002 | Calça Jeans Slim      | 139.9 |
      | P003 | Tênis Casual Urbano   | 189.9 |
      | P004 | Boné Aba Curva        | 49.9  |
      | P005 | Mochila Urbana 20L    | 100   |
      | P006 | Kit 3 Pares de Meias  | 29.9  |
      | P007 | Jaqueta Corta-Vento   | 229.9 |
      | P008 | Garrafa Térmica 750ml | 50    |

  Cenário: CT-API-41 Consulta de um produto existente
    Quando envio uma requisição GET para "/api/produtos/P001"
    Então o status da resposta é 200
    E a resposta traz o produto "Camiseta Essencial" com o preço 59.9

  Cenário: CT-API-42 Consulta de um produto inexistente
    Quando envio uma requisição GET para "/api/produtos/P999"
    Então o status da resposta é 404
    E o código de erro é "PRODUTO_NAO_ENCONTRADO"

  Esquema do Cenário: CT-API-43 Corpo que não é um objeto JSON válido é recusado: <caso>
    Quando envio uma requisição POST para "<rota>" com o corpo:
      """
      <corpo>
      """
    Então o status da resposta é 400
    E o código de erro é "JSON_INVALIDO"

    Exemplos:
      | caso                      | rota                   | corpo     |
      | JSON malformado           | /api/carrinho/calcular | {"itens": |
      | lista no lugar do objeto  | /api/carrinho/calcular | []        |
      | texto no lugar do objeto  | /api/carrinho/calcular | "texto"   |
      | JSON malformado no pedido | /api/pedidos           | {"itens": |

  Cenário: CT-API-44 Rota inexistente
    Quando envio uma requisição GET para "/api/qualquercoisa"
    Então o status da resposta é 404
    E o código de erro é "ROTA_NAO_ENCONTRADA"

  Esquema do Cenário: CT-API-45 Método <metodo> não é aceito em "<rota>"
    Quando envio uma requisição <metodo> para "<rota>"
    Então o status da resposta é 405
    E o código de erro é "METODO_NAO_PERMITIDO"

    Exemplos:
      | metodo | rota                   |
      | GET    | /api/pedidos           |
      | GET    | /api/carrinho/calcular |
      | POST   | /api/produtos          |

  Esquema do Cenário: CT-API-46 Lista de itens ausente ou vazia é recusada: <caso>
    Quando envio uma requisição POST para "/api/carrinho/calcular" com o corpo:
      """
      <corpo>
      """
    Então o status da resposta é 422
    E o código de erro é "ITENS_OBRIGATORIOS"
    E o erro aponta o campo "itens"

    Exemplos:
      | caso          | corpo                   |
      | itens ausente | {"cupom": "BEMVINDO10"} |
      | itens vazio   | {"itens": []}           |

  Cenário: CT-API-47 Item que não é um objeto é recusado
    Quando envio uma requisição POST para "/api/carrinho/calcular" com o corpo:
      """
      {"itens": ["P005"]}
      """
    Então o status da resposta é 422
    E o código de erro é "ITEM_INVALIDO"
    E o erro aponta o campo "itens[0]"

  # BUG-03: a API responde PRODUTO_NAO_ENCONTRADO com a mensagem "Produto undefined não encontrado."
  @bug @BUG-03
  Cenário: CT-API-48 Item sem produtoId é recusado como item inválido
    Quando envio uma requisição POST para "/api/carrinho/calcular" com o corpo:
      """
      {"itens": [{"quantidade": 1}]}
      """
    Então o status da resposta é 422
    E o código de erro é "ITEM_INVALIDO"

  @ambiguidade
  Cenário: CT-API-49 Item sem quantidade é recusado
    # A documentação permite ler este caso como ITEM_INVALIDO ou QUANTIDADE_INVALIDA.
    # Ver docs/ambiguidades.md, item 6.
    Quando envio uma requisição POST para "/api/carrinho/calcular" com o corpo:
      """
      {"itens": [{"produtoId": "P005"}]}
      """
    Então o status da resposta é 422
    E o código de erro é "QUANTIDADE_INVALIDA"
    E o erro aponta o campo "itens[0].quantidade"

  Cenário: CT-API-50 Item com produto inexistente é recusado
    Quando calculo o carrinho com o produto "P999" na quantidade 1
    Então o status da resposta é 422
    E o código de erro é "PRODUTO_NAO_ENCONTRADO"
    E o erro aponta o campo "itens[0].produtoId"

  Esquema do Cenário: CT-API-51 Todo erro traz código e mensagem: <caso>
    Quando envio uma requisição <metodo> para "<rota>"
    Então o status da resposta é <status>
    E o erro traz código e mensagem

    Exemplos:
      | caso                  | metodo | rota                | status |
      | rota inexistente      | GET    | /api/qualquercoisa  | 404    |
      | produto inexistente   | GET    | /api/produtos/P999  | 404    |
      | método não permitido  | GET    | /api/pedidos        | 405    |
      | corpo ausente         | POST   | /api/pedidos        | 400    |
