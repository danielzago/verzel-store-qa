# language: pt
@ui @checkout
Funcionalidade: Finalização da compra
  Como cliente da Verzel Store
  Quero informar meus dados e confirmar o pedido
  Para receber minha compra com o desconto e o frete do carrinho

  Cenário: CT-UI-30 Pedido com cupom é confirmado com os valores do carrinho
    Dado que o carrinho contém "1x Mochila Urbana 20L"
    E aplico o cupom "BEMVINDO10"
    Quando sigo para finalizar a compra
    Então o resumo exibe subtotal "R$ 100,00", desconto "- R$ 10,00", frete "R$ 19,90" e total "R$ 109,90"
    Quando informo nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "01310-100"
    E confirmo o pedido
    Então o pedido é confirmado com um número no formato VZ-000000
    E a confirmação agradece a "Maria"
    E o resumo exibe subtotal "R$ 100,00", desconto "- R$ 10,00", frete "R$ 19,90" e total "R$ 109,90"

  Cenário: CT-UI-31 Pedido com frete grátis e CEP sem hífen é confirmado
    Dado que o carrinho contém "1x Jaqueta Corta-Vento"
    Quando sigo para finalizar a compra
    E informo nome "João Souza", e-mail "joao@exemplo.com" e CEP "01310100"
    E confirmo o pedido
    Então o pedido é confirmado com um número no formato VZ-000000
    E o resumo exibe subtotal "R$ 229,90", desconto "R$ 0,00", frete "Grátis" e total "R$ 229,90"

  Esquema do Cenário: CT-UI-32 Dados inválidos do cliente impedem o pedido: <caso>
    Dado que o carrinho contém "1x Mochila Urbana 20L"
    Quando sigo para finalizar a compra
    E informo nome "<nome>", e-mail "<email>" e CEP "<cep>"
    E confirmo o pedido
    Então vejo o erro "<erro>" no campo "<campo>"
    E continuo na página de finalização

    Exemplos:
      | caso                 | nome        | email             | cep       | campo         | erro                          |
      | nome sem sobrenome   | Maria       | maria@exemplo.com | 01310-100 | Nome completo | Informe nome e sobrenome.     |
      | nome vazio           |             | maria@exemplo.com | 01310-100 | Nome completo | Informe o nome completo.      |
      | e-mail sem arroba    | Maria Silva | mariaexemplo.com  | 01310-100 | E-mail        | Informe um e-mail válido.     |
      | e-mail sem domínio   | Maria Silva | maria@            | 01310-100 | E-mail        | Informe um e-mail válido.     |
      | e-mail vazio         | Maria Silva |                   | 01310-100 | E-mail        | Informe o e-mail.             |
      | CEP com 7 dígitos    | Maria Silva | maria@exemplo.com | 0131010   | CEP           | Informe um CEP com 8 dígitos. |
      | CEP com 9 dígitos    | Maria Silva | maria@exemplo.com | 013101000 | CEP           | Informe um CEP com 8 dígitos. |
      | CEP com letras       | Maria Silva | maria@exemplo.com | 0131A-100 | CEP           | Informe um CEP com 8 dígitos. |
      | CEP vazio            | Maria Silva | maria@exemplo.com |           | CEP           | Informe o CEP.                |

  Cenário: CT-UI-33 Todos os campos inválidos são apontados de uma vez
    Dado que o carrinho contém "1x Mochila Urbana 20L"
    Quando sigo para finalizar a compra
    E informo nome "Maria", e-mail "maria" e CEP "123"
    E confirmo o pedido
    Então vejo o erro "Informe nome e sobrenome." no campo "Nome completo"
    E vejo o erro "Informe um e-mail válido." no campo "E-mail"
    E vejo o erro "Informe um CEP com 8 dígitos." no campo "CEP"
    E continuo na página de finalização

  Cenário: CT-UI-34 Não é possível finalizar a compra com o carrinho vazio
    Quando acesso a página de finalização sem itens no carrinho
    Então o carrinho está vazio
