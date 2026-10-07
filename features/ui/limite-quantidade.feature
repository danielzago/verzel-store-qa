# language: pt
@ui @quantidade @CA10
Funcionalidade: Limite de 5 unidades por produto na interface
  Como Verzel Store
  Quero limitar cada produto a 5 unidades por pedido
  Para que a regra do pedido seja respeitada já no carrinho

  Cenário: CT-UI-20 O carrinho permite aumentar até 5 unidades e bloqueia a sexta
    Dado que o carrinho contém "1x Garrafa Térmica 750ml"
    Quando aumento a quantidade de "Garrafa Térmica 750ml" para 5
    Então a quantidade de "Garrafa Térmica 750ml" é 5
    E o total do item "Garrafa Térmica 750ml" é "R$ 250,00"
    E o botão de aumentar a quantidade de "Garrafa Térmica 750ml" está desabilitado
    E o carrinho avisa o limite de unidades para "Garrafa Térmica 750ml"

  Cenário: CT-UI-21 A vitrine bloqueia o produto depois de 5 unidades adicionadas
    # Adicionar várias vezes pela vitrine é o caminho mais comum para burlar o limite.
    Dado que estou na vitrine
    Quando adiciono 5 unidades de "Kit 3 Pares de Meias" pela vitrine
    Então a vitrine informa "Limite de 5 unidades atingido." para "Kit 3 Pares de Meias"
    E o botão de adicionar "Kit 3 Pares de Meias" está desabilitado
    E o contador do carrinho mostra 5

  Cenário: CT-UI-22 O limite vale por produto, não pelo carrinho inteiro
    Dado que o carrinho contém "5x Kit 3 Pares de Meias, 5x Garrafa Térmica 750ml"
    Quando visualizo o resumo do pedido
    Então a quantidade de "Kit 3 Pares de Meias" é 5
    E a quantidade de "Garrafa Térmica 750ml" é 5
    E o resumo exibe subtotal "R$ 399,50", desconto "R$ 0,00", frete "Grátis" e total "R$ 399,50"

  Cenário: CT-UI-23 A quantidade mínima no carrinho é 1
    Dado que o carrinho contém "1x Garrafa Térmica 750ml"
    Quando visualizo o resumo do pedido
    Então a quantidade de "Garrafa Térmica 750ml" é 1
    E o botão de diminuir a quantidade de "Garrafa Térmica 750ml" está desabilitado

  Cenário: CT-UI-24 Remover um item recalcula o resumo
    Dado que o carrinho contém "1x Jaqueta Corta-Vento, 1x Boné Aba Curva"
    Quando removo "Jaqueta Corta-Vento" do carrinho
    Então o resumo exibe subtotal "R$ 49,90", desconto "R$ 0,00", frete "R$ 19,90" e total "R$ 69,80"
    E o carrinho informa "Faltam R$ 150,10 para o frete grátis."

  Cenário: CT-UI-25 Esvaziar o carrinho remove todos os itens
    Dado que o carrinho contém "2x Camiseta Essencial, 1x Boné Aba Curva"
    Quando esvazio o carrinho
    Então o carrinho está vazio
    E o contador do carrinho mostra 0
