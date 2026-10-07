# language: pt
@api @pedidos
Funcionalidade: Confirmação de pedido pela API
  POST /api/pedidos valida os dados do cliente, os itens e o cupom antes de confirmar.
  O pedido não é armazenado e o número gerado é fictício, como descrito em "Sobre este ambiente".

  # Quando o cenário não informa o cliente, é usado: Maria Silva, maria@exemplo.com, 01310-100.

  Cenário: CT-API-20 Pedido válido com cupom é confirmado
    Quando envio um pedido com "1x P005" e o cupom "BEMVINDO10"
    Então o status da resposta é 201
    E o número do pedido segue o formato VZ-000000
    E o resumo da resposta tem subtotal 100, desconto 10, frete 19.90, faltante 100 e total 109.90
    E o cupom da resposta está aplicado com o código "BEMVINDO10"
    E o CEP do cliente é devolvido como "01310100"

  @CA11
  Esquema do Cenário: CT-API-21 O pedido devolve o mesmo resumo do cálculo do carrinho para "<itens>"
    Quando envio um pedido com "<itens>" e o cupom "BEMVINDO10"
    Então o status da resposta é 201
    E o resumo do pedido é igual ao do cálculo do carrinho para "<itens>" e o cupom "BEMVINDO10"

    Exemplos:
      | itens                     |
      | 1x P002, 2x P004          |
      | 3x P001                   |
      | 1x P004, 1x P005, 1x P008 |

  @CA06 @bug @BUG-01
  Cenário: CT-API-22 Pedido com subtotal de exatamente R$ 200,00 tem frete grátis
    Quando envio um pedido com "2x P005"
    Então o status da resposta é 201
    E o resumo da resposta tem subtotal 200, desconto 0, frete 0, faltante 0 e total 200

  Esquema do Cenário: CT-API-23 CEP "<cep>" com 8 dígitos é aceito
    Quando envio um pedido com "1x P005" alterando o campo "cep" do cliente para "<cep>"
    Então o status da resposta é 201
    E o CEP do cliente é devolvido como "01310100"

    Exemplos:
      | cep       |
      | 01310-100 |
      | 01310100  |

  Esquema do Cenário: CT-API-24 Pedido é recusado com <caso>
    Quando envio um pedido com "1x P005" alterando o campo "<campo>" do cliente para "<valor>"
    Então o status da resposta é 422
    E o código de erro é "DADOS_INVALIDOS"
    E o erro lista os campos "cliente.<campo>"

    Exemplos: Nome precisa ter nome e sobrenome
      | caso                 | campo | valor |
      | nome sem sobrenome   | nome  | Maria |
      | nome vazio           | nome  |       |

    Exemplos: E-mail precisa ter formato válido
      | caso                 | campo | valor            |
      | e-mail sem arroba    | email | mariaexemplo.com |
      | e-mail sem domínio   | email | maria@           |
      | e-mail sem extensão  | email | maria@exemplo    |
      | e-mail com espaço    | email | ma ria@exemplo.com |
      | e-mail vazio         | email |                  |

    Exemplos: CEP precisa ter 8 dígitos
      | caso                 | campo | valor     |
      | CEP com 7 dígitos    | cep   | 0131010   |
      | CEP com 9 dígitos    | cep   | 013101000 |
      | CEP com letras       | cep   | 0131A-100 |
      | CEP vazio            | cep   |           |

  Cenário: CT-API-25 Vários dados inválidos são listados de uma vez
    Quando envio um pedido com "1x P005" e o cliente:
      | nome  | Maria |
      | email | maria |
      | cep   | 123   |
    Então o status da resposta é 422
    E o código de erro é "DADOS_INVALIDOS"
    E o erro lista os campos "cliente.nome, cliente.email, cliente.cep"

  @CA03 @CA04
  Esquema do Cenário: CT-API-26 Pedido com o cupom "<cupom>" é recusado
    # Diferente do cálculo do carrinho, aqui o cupom inválido ou expirado gera erro.
    Quando envio um pedido com "1x P005" e o cupom "<cupom>"
    Então o status da resposta é 422
    E o código de erro é "<codigo>"
    E o erro aponta o campo "cupom"

    Exemplos:
      | cupom                     | codigo         |
      | NAOEXISTE                 | CUPOM_INVALIDO |
      | BEM VINDO10               | CUPOM_INVALIDO |
      | VERAO2026                 | CUPOM_EXPIRADO |
      | [espaço]verao2026[espaço] | CUPOM_EXPIRADO |

  @CA10
  Cenário: CT-API-27 Pedido com 5 unidades do mesmo produto é aceito
    Quando envio um pedido com o produto "P008" na quantidade 5
    Então o status da resposta é 201

  # BUG-02: o pedido é confirmado (201) com mais de 5 unidades do mesmo produto.
  @CA10 @bug @BUG-02
  Esquema do Cenário: CT-API-28 Pedido com mais de 5 unidades do mesmo produto é recusado: <quantidade>
    Quando envio um pedido com o produto "P008" na quantidade <quantidade>
    Então o status da resposta é 422
    E o código de erro é "QUANTIDADE_MAXIMA_EXCEDIDA"

    Exemplos:
      | quantidade |
      | 6          |
      | 10         |

  @CA10
  Esquema do Cenário: CT-API-29 Pedido com a quantidade inválida <quantidade> é recusado
    Quando envio um pedido com o produto "P008" na quantidade <quantidade>
    Então o status da resposta é 422
    E o código de erro é "QUANTIDADE_INVALIDA"
    E o erro aponta o campo "itens[0].quantidade"

    Exemplos:
      | quantidade |
      | 0          |
      | -1         |
      | 1.5        |

  @CA10
  Cenário: CT-API-30 Pedido com o mesmo produto repetido é recusado
    Quando envio um pedido com "3x P005, 3x P005"
    Então o status da resposta é 422
    E o código de erro é "ITEM_DUPLICADO"

  Cenário: CT-API-31 Pedido sem itens é recusado
    Quando envio uma requisição POST para "/api/pedidos" com o corpo:
      """
      {
        "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310-100" },
        "itens": []
      }
      """
    Então o status da resposta é 422
    E o código de erro é "ITENS_OBRIGATORIOS"
    E o erro aponta o campo "itens"
