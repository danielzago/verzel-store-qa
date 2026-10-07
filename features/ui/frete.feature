# language: pt
@ui @frete
Funcionalidade: Frete grátis no carrinho
  Como cliente da Verzel Store
  Quero ganhar frete grátis em compras a partir de R$ 200,00
  Para pagar menos nas minhas compras

  @CA07
  Esquema do Cenário: CT-UI-10 Abaixo de R$ 200,00 cobra frete fixo e informa quanto falta (subtotal <subtotal>)
    Dado que o carrinho contém "<itens>"
    Quando visualizo o resumo do pedido
    Então o resumo exibe subtotal "<subtotal>", desconto "R$ 0,00", frete "R$ 19,90" e total "<total>"
    E o carrinho informa "Faltam <faltante> para o frete grátis."

    Exemplos:
      | itens                                                             | subtotal  | faltante  | total     |
      | 1x Kit 3 Pares de Meias                                           | R$ 29,90  | R$ 170,10 | R$ 49,80  |
      | 1x Camiseta Essencial                                             | R$ 59,90  | R$ 140,10 | R$ 79,80  |
      | 1x Tênis Casual Urbano                                            | R$ 189,90 | R$ 10,10  | R$ 209,80 |
      | 1x Boné Aba Curva, 1x Mochila Urbana 20L, 1x Garrafa Térmica 750ml | R$ 199,90 | R$ 0,10   | R$ 219,80 |

  @CA06
  Esquema do Cenário: CT-UI-11 A partir de R$ 200,00 o frete é grátis para "<itens>"
    Dado que o carrinho contém "<itens>"
    Quando visualizo o resumo do pedido
    Então o resumo exibe subtotal "<subtotal>", desconto "R$ 0,00", frete "Grátis" e total "<subtotal>"
    E o carrinho não exibe aviso de valor faltante

    Exemplos: Acima do limite
      | itens                                           | subtotal  |
      | 3x Garrafa Térmica 750ml, 1x Camiseta Essencial | R$ 209,90 |
      | 1x Jaqueta Corta-Vento                          | R$ 229,90 |

    # BUG-01: com subtotal de exatamente R$ 200,00 a loja cobra R$ 19,90 de frete.
    @bug @BUG-01
    Exemplos: Exatamente no limite
      | itens                                           | subtotal  |
      | 2x Mochila Urbana 20L                           | R$ 200,00 |
      | 4x Garrafa Térmica 750ml                        | R$ 200,00 |
      | 1x Mochila Urbana 20L, 2x Garrafa Térmica 750ml | R$ 200,00 |

  @CA08
  Cenário: CT-UI-12 O frete grátis considera o subtotal antes do desconto
    # 209,90 - 20,99 = 188,91. O valor pago fica abaixo de 200, mas o frete continua grátis.
    Dado que o carrinho contém "3x Garrafa Térmica 750ml, 1x Camiseta Essencial"
    Quando aplico o cupom "BEMVINDO10"
    Então o resumo exibe subtotal "R$ 209,90", desconto "- R$ 20,99", frete "Grátis" e total "R$ 188,91"
    E o carrinho não exibe aviso de valor faltante

  @CA06 @CA08 @bug @BUG-01
  Cenário: CT-UI-13 Subtotal de exatamente R$ 200,00 com cupom mantém o frete grátis
    Dado que o carrinho contém "2x Mochila Urbana 20L"
    Quando aplico o cupom "BEMVINDO10"
    Então o resumo exibe subtotal "R$ 200,00", desconto "- R$ 20,00", frete "Grátis" e total "R$ 180,00"
    E o carrinho não exibe aviso de valor faltante

  @CA09
  Esquema do Cenário: CT-UI-14 O desconto do cupom não incide sobre o frete (subtotal <subtotal>)
    # Se o desconto pegasse o frete, os totais seriam R$ 107,91 e R$ 197,82.
    Dado que o carrinho contém "<itens>"
    Quando aplico o cupom "BEMVINDO10"
    Então o resumo exibe subtotal "<subtotal>", desconto "<desconto>", frete "R$ 19,90" e total "<total>"

    Exemplos:
      | itens                                                             | subtotal  | desconto   | total     |
      | 1x Mochila Urbana 20L                                             | R$ 100,00 | - R$ 10,00 | R$ 109,90 |
      | 1x Boné Aba Curva, 1x Mochila Urbana 20L, 1x Garrafa Térmica 750ml | R$ 199,90 | - R$ 19,99 | R$ 199,81 |

  @CA06 @CA07
  Cenário: CT-UI-15 O frete muda quando o carrinho cruza o limite nos dois sentidos
    Dado que o carrinho contém "1x Calça Jeans Slim"
    Quando visualizo o resumo do pedido
    Então o resumo exibe subtotal "R$ 139,90", desconto "R$ 0,00", frete "R$ 19,90" e total "R$ 159,80"
    E o carrinho informa "Faltam R$ 60,10 para o frete grátis."
    Quando aumento a quantidade de "Calça Jeans Slim" para 2
    Então o resumo exibe subtotal "R$ 279,80", desconto "R$ 0,00", frete "Grátis" e total "R$ 279,80"
    E o carrinho não exibe aviso de valor faltante
    Quando diminuo a quantidade de "Calça Jeans Slim" para 1
    Então o resumo exibe subtotal "R$ 139,90", desconto "R$ 0,00", frete "R$ 19,90" e total "R$ 159,80"
    E o carrinho informa "Faltam R$ 60,10 para o frete grátis."

  @CA11
  Esquema do Cenário: CT-UI-16 Os valores da tela são os mesmos calculados pela API
    Dado que o carrinho contém "<itens>"
    Quando aplico o cupom "BEMVINDO10"
    Então os valores do resumo na tela são iguais aos calculados pela API

    Exemplos:
      | itens                                       |
      | 3x Camiseta Essencial                       |
      | 1x Calça Jeans Slim, 2x Boné Aba Curva      |
      | 3x Kit 3 Pares de Meias, 1x Boné Aba Curva  |

  @ambiguidade
  Cenário: CT-UI-17 Carrinho vazio não exibe resumo nem aviso de frete
    # A documentação não diz o que o carrinho vazio mostra. Ver docs/ambiguidades.md, item 5.
    Dado que o carrinho contém "1x Mochila Urbana 20L"
    Quando removo "Mochila Urbana 20L" do carrinho
    Então o carrinho está vazio
