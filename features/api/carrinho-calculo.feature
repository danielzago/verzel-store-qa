# language: pt
@api @calculo
Funcionalidade: Cálculo do carrinho pela API
  A API calcula subtotal, desconto, frete e total.
  A interface apenas exibe o resultado, então as regras são validadas aqui também.

  # Os valores monetários seguem o formato da API: número em reais, como 59.9 para R$ 59,90.

  @CA06 @CA07 @CA11
  Esquema do Cenário: CT-API-01 Cálculo sem cupom para "<itens>"
    Quando calculo o carrinho com "<itens>"
    Então o status da resposta é 200
    E o resumo da resposta tem subtotal <subtotal>, desconto 0, frete <frete>, faltante <faltante> e total <total>
    E o indicador de frete grátis é "<gratis>"
    E todos os valores monetários têm no máximo 2 casas decimais
    E o total de cada item é o preço unitário vezes a quantidade

    Exemplos: Abaixo do limite de frete grátis
      | itens                     | subtotal | frete | faltante | total  | gratis |
      | 1x P006                   | 29.90    | 19.90 | 170.10   | 49.80  | não    |
      | 1x P005                   | 100.00   | 19.90 | 100.00   | 119.90 | não    |
      | 3x P001                   | 179.70   | 19.90 | 20.30    | 199.60 | não    |
      | 1x P004, 1x P005, 1x P008 | 199.90   | 19.90 | 0.10     | 219.80 | não    |

    Exemplos: Acima do limite de frete grátis
      | itens            | subtotal | frete | faltante | total  | gratis |
      | 3x P008, 1x P001 | 209.90   | 0     | 0        | 209.90 | sim    |
      | 1x P007          | 229.90   | 0     | 0        | 229.90 | sim    |
      | 5x P005          | 500.00   | 0     | 0        | 500.00 | sim    |

    # BUG-01: com subtotal de exatamente 200 a API devolve frete 19.9 e freteGratis false.
    @bug @BUG-01
    Exemplos: Exatamente no limite de frete grátis
      | itens            | subtotal | frete | faltante | total  | gratis |
      | 2x P005          | 200.00   | 0     | 0        | 200.00 | sim    |
      | 4x P008          | 200.00   | 0     | 0        | 200.00 | sim    |
      | 1x P005, 2x P008 | 200.00   | 0     | 0        | 200.00 | sim    |

  @CA01 @CA08 @CA09 @CA11
  Esquema do Cenário: CT-API-02 Cálculo com o cupom BEMVINDO10 para "<itens>"
    Quando calculo o carrinho com "<itens>" e o cupom "BEMVINDO10"
    Então o status da resposta é 200
    E o cupom da resposta está aplicado com o código "BEMVINDO10"
    E o resumo da resposta tem subtotal <subtotal>, desconto <desconto>, frete <frete>, faltante <faltante> e total <total>
    E todos os valores monetários têm no máximo 2 casas decimais

    Exemplos: Desconto só sobre os produtos, frete cobrado à parte
      | itens                     | subtotal | desconto | frete | faltante | total  |
      | 1x P005                   | 100.00   | 10.00    | 19.90 | 100.00   | 109.90 |
      | 1x P006                   | 29.90    | 2.99     | 19.90 | 170.10   | 46.81  |
      | 3x P001                   | 179.70   | 17.97    | 19.90 | 20.30    | 181.63 |
      | 1x P004, 1x P005, 1x P008 | 199.90   | 19.99    | 19.90 | 0.10     | 199.81 |

    Exemplos: Frete grátis decidido pelo subtotal antes do desconto
      | itens                                                         | subtotal | desconto | frete | faltante | total   |
      | 3x P008, 1x P001                                              | 209.90   | 20.99    | 0     | 0        | 188.91  |
      | 1x P002, 2x P004                                              | 239.70   | 23.97    | 0     | 0        | 215.73  |
      | 5x P001, 5x P002, 5x P003, 5x P004, 5x P005, 5x P006, 5x P007, 5x P008 | 4247.00  | 424.70   | 0     | 0        | 3822.30 |

    @bug @BUG-01
    Exemplos: Exatamente no limite de frete grátis
      | itens   | subtotal | desconto | frete | faltante | total  |
      | 2x P005 | 200.00   | 20.00    | 0     | 0        | 180.00 |

  @CA02
  Esquema do Cenário: CT-API-03 O cupom é aceito sem diferenciar maiúsculas e ignorando espaços nas pontas: "<cupom>"
    # [espaço] representa um espaço em branco enviado no código do cupom.
    Quando calculo o carrinho com "1x P005" e o cupom "<cupom>"
    Então o status da resposta é 200
    E o cupom da resposta está aplicado com o código "BEMVINDO10"
    E o resumo da resposta tem subtotal 100, desconto 10, frete 19.90, faltante 100 e total 109.90

    Exemplos:
      | cupom                              |
      | bemvindo10                         |
      | BemVindo10                         |
      | [espaço][espaço]BEMVINDO10         |
      | BEMVINDO10[espaço][espaço]         |
      | [espaço]bemvindo10[espaço][espaço] |

  @CA03 @CA04
  Esquema do Cenário: CT-API-04 No cálculo, o cupom "<cupom>" não gera erro e não dá desconto
    Quando calculo o carrinho com "1x P005" e o cupom "<cupom>"
    Então o status da resposta é 200
    E o cupom da resposta não foi aplicado, com a mensagem "<mensagem>"
    E o resumo da resposta tem subtotal 100, desconto 0, frete 19.90, faltante 100 e total 119.90

    Exemplos:
      | cupom                     | mensagem        |
      | NAOEXISTE                 | Cupom inválido. |
      | BEM VINDO10               | Cupom inválido. |
      | VERAO2026                 | Cupom expirado. |
      | [espaço]verao2026[espaço] | Cupom expirado. |

  @CA10
  Esquema do Cenário: CT-API-05 O cálculo aceita de 1 a 5 unidades por produto: <quantidade>
    Quando calculo o carrinho com o produto "P008" na quantidade <quantidade>
    Então o status da resposta é 200

    Exemplos:
      | quantidade |
      | 1          |
      | 5          |

  # BUG-02: a API aceita qualquer quantidade acima de 5 e devolve 200 com o cálculo.
  @CA10 @bug @BUG-02
  Esquema do Cenário: CT-API-06 O cálculo recusa mais de 5 unidades por produto: <quantidade>
    Quando calculo o carrinho com o produto "P008" na quantidade <quantidade>
    Então o status da resposta é 422
    E o código de erro é "QUANTIDADE_MAXIMA_EXCEDIDA"

    Exemplos:
      | quantidade |
      | 6          |
      | 10         |

  @CA10
  Esquema do Cenário: CT-API-07 O cálculo recusa a quantidade inválida <quantidade>
    # A quantidade é enviada exatamente como está na tabela, em JSON.
    Quando calculo o carrinho com o produto "P008" na quantidade <quantidade>
    Então o status da resposta é 422
    E o código de erro é "QUANTIDADE_INVALIDA"
    E o erro aponta o campo "itens[0].quantidade"

    Exemplos:
      | quantidade |
      | 0          |
      | -1         |
      | 1.5        |
      | null       |
      | "2"        |

  @CA10
  Cenário: CT-API-08 O mesmo produto repetido na lista é recusado
    # Sem esta regra, 3 + 3 unidades do mesmo produto passariam do limite de 5.
    Quando calculo o carrinho com "3x P005, 3x P005"
    Então o status da resposta é 422
    E o código de erro é "ITEM_DUPLICADO"
    E o erro aponta o campo "itens[1].produtoId"
