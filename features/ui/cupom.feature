# language: pt
@ui @cupom
Funcionalidade: Cupom de desconto no carrinho
  Como cliente da Verzel Store
  Quero aplicar um cupom de desconto
  Para pagar menos nas minhas compras

  # Nos exemplos, [espaço] representa um espaço em branco digitado no campo.
  # O Gherkin descarta espaços nas pontas das células, por isso o marcador.

  Contexto:
    Dado que o carrinho contém "1x Mochila Urbana 20L"

  @CA01 @CA02
  Esquema do Cenário: CT-UI-01 Cupom válido é aceito quando digitado como "<codigo>"
    Quando aplico o cupom "<codigo>"
    Então o cupom "BEMVINDO10" aparece como aplicado
    E o resumo exibe subtotal "R$ 100,00", desconto "- R$ 10,00", frete "R$ 19,90" e total "R$ 109,90"

    Exemplos: Maiúsculas e minúsculas
      | codigo     |
      | BEMVINDO10 |
      | bemvindo10 |
      | BemVindo10 |

    Exemplos: Espaços no início e no fim
      | codigo                             |
      | [espaço][espaço]BEMVINDO10         |
      | BEMVINDO10[espaço][espaço]         |
      | [espaço]bemvindo10[espaço][espaço] |

  @CA03
  Esquema do Cenário: CT-UI-02 Cupom inexistente "<codigo>" é recusado
    Quando aplico o cupom "<codigo>"
    Então vejo a mensagem de cupom "Cupom inválido."
    E nenhum cupom está aplicado
    E o resumo exibe subtotal "R$ 100,00", desconto "R$ 0,00", frete "R$ 19,90" e total "R$ 119,90"

    Exemplos:
      | codigo      |
      | NAOEXISTE   |
      | BEM VINDO10 |
      | BEMVINDO    |
      | BEMVINDO15  |

  @CA04
  Esquema do Cenário: CT-UI-03 Cupom expirado "<codigo>" é recusado
    Quando aplico o cupom "<codigo>"
    Então vejo a mensagem de cupom "Cupom expirado."
    E nenhum cupom está aplicado
    E o resumo exibe subtotal "R$ 100,00", desconto "R$ 0,00", frete "R$ 19,90" e total "R$ 119,90"

    Exemplos:
      | codigo                     |
      | VERAO2026                  |
      | [espaço]verao2026[espaço]  |

  @CA05
  Cenário: CT-UI-04 Com um cupom aplicado não é possível informar outro
    Quando aplico o cupom "BEMVINDO10"
    Então o cupom "BEMVINDO10" aparece como aplicado
    E não é possível informar outro cupom

  @CA05
  Cenário: CT-UI-05 Remover o cupom zera o desconto e recalcula o total
    Quando aplico o cupom "BEMVINDO10"
    E removo o cupom
    Então nenhum cupom está aplicado
    E o resumo exibe subtotal "R$ 100,00", desconto "R$ 0,00", frete "R$ 19,90" e total "R$ 119,90"

  @CA05
  Cenário: CT-UI-06 Trocar de cupom exige remover o atual antes
    Quando aplico o cupom "BEMVINDO10"
    E removo o cupom
    E aplico o cupom "VERAO2026"
    Então vejo a mensagem de cupom "Cupom expirado."
    E o resumo exibe subtotal "R$ 100,00", desconto "R$ 0,00", frete "R$ 19,90" e total "R$ 119,90"

  @CA01
  Cenário: CT-UI-07 O desconto acompanha a mudança de quantidade
    Quando aplico o cupom "BEMVINDO10"
    E aumento a quantidade de "Mochila Urbana 20L" para 3
    Então o resumo exibe subtotal "R$ 300,00", desconto "- R$ 30,00", frete "Grátis" e total "R$ 270,00"
    Quando diminuo a quantidade de "Mochila Urbana 20L" para 1
    Então o resumo exibe subtotal "R$ 100,00", desconto "- R$ 10,00", frete "R$ 19,90" e total "R$ 109,90"

  @ambiguidade
  Cenário: CT-UI-08 Aplicar com o campo de cupom vazio pede um código
    # A documentação não cobre este caso. Ver docs/ambiguidades.md, item 2.
    Quando aplico o cupom ""
    Então vejo a mensagem de cupom "Informe um cupom."
    E o resumo exibe subtotal "R$ 100,00", desconto "R$ 0,00", frete "R$ 19,90" e total "R$ 119,90"
