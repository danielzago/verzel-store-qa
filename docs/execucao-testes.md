# Execução dos testes

| | |
|---|---|
| Entrega testada | VZS-142, cupom de desconto e frete grátis, versão 2.3.0 |
| Ambiente | https://verzel-store.qa-test-verzel-store.workers.dev/ |
| Data | 06/10/2026 |
| Navegador | Baseado em Chromium, no Windows |
| Resultado | 51 de 59 cenários passaram. 8 falharam, por 3 bugs descritos em [`bugs.md`](bugs.md) |

## Como foi executado

- **Interface**: cada cenário foi executado na loja real, pelos mesmos botões, links e campos que o cliente usa. Os valores foram lidos da tela.
- **API**: cada cenário foi executado com requisições enviadas a `/api` da loja real.
- Os passos seguidos são os dos arquivos `.feature` em [`features/`](../features/). Cada linha das tabelas abaixo é um cenário ou um exemplo de um esquema de cenário.
- A execução foi conduzida com apoio de IA (Claude).
- Os pedidos enviados usaram dados fictícios (Maria Silva, maria@exemplo.com, 01310-100). A loja não armazena pedidos.

Os mesmos cenários estão automatizados com Playwright. A execução automatizada de 06/10/2026, às 12:30, deu o mesmo resultado: 143 testes, 129 passaram e 14 falharam. Os prints e a saída dos testes que falharam estão em [`evidencias.md`](evidencias.md).

## Resumo

| Camada | Arquivo | Cenários | Cenários com falha | Testes | Passaram | Falharam |
|---|---|---|---|---|---|---|
| Interface | [`cupom.feature`](../features/ui/cupom.feature) | 8 | 0 | 17 | 17 | 0 |
| Interface | [`frete.feature`](../features/ui/frete.feature) | 8 | 2 | 18 | 14 | 4 |
| Interface | [`limite-quantidade.feature`](../features/ui/limite-quantidade.feature) | 6 | 0 | 6 | 6 | 0 |
| Interface | [`checkout.feature`](../features/ui/checkout.feature) | 5 | 0 | 13 | 13 | 0 |
| API | [`carrinho-calculo.feature`](../features/api/carrinho-calculo.feature) | 8 | 3 | 37 | 31 | 6 |
| API | [`pedidos.feature`](../features/api/pedidos.feature) | 12 | 2 | 31 | 28 | 3 |
| API | [`contrato-erros.feature`](../features/api/contrato-erros.feature) | 12 | 1 | 21 | 20 | 1 |
| **Total** | | **59** | **8** | **143** | **129** | **14** |

Os 59 cenários geram 143 testes por causa dos exemplos: 129 passaram e 14 falharam.

| Bug | Resumo | Cenários que falharam |
|---|---|---|
| [BUG-01](bugs.md#bug-01) | Frete cobrado com subtotal de exatamente R$ 200,00 | CT-UI-11 (3 exemplos), CT-UI-13, CT-API-01 (3 exemplos), CT-API-02 (1 exemplo), CT-API-22 |
| [BUG-02](bugs.md#bug-02) | API aceita mais de 5 unidades do mesmo produto | CT-API-06 (2 exemplos), CT-API-28 (2 exemplos) |
| [BUG-03](bugs.md#bug-03) | Item sem `produtoId` devolve o erro errado | CT-API-48 |

## Resultados da interface

### Cupom de desconto no carrinho

Arquivo: [`features/ui/cupom.feature`](../features/ui/cupom.feature)

| Cenário | Exemplo | Resultado | Obtido |
|---|---|---|---|
| **CT-UI-01** Cupom válido é aceito, sem diferenciar maiúsculas e ignorando espaços nas pontas | BEMVINDO10 | Passou | "Cupom BEMVINDO10 aplicado."; subtotal R$ 100,00, desconto - R$ 10,00, frete R$ 19,90, total R$ 109,90 |
|  | bemvindo10 | Passou | "Cupom BEMVINDO10 aplicado."; subtotal R$ 100,00, desconto - R$ 10,00, frete R$ 19,90, total R$ 109,90 |
|  | BemVindo10 | Passou | "Cupom BEMVINDO10 aplicado."; subtotal R$ 100,00, desconto - R$ 10,00, frete R$ 19,90, total R$ 109,90 |
|  | [espaço][espaço]BEMVINDO10 | Passou | "Cupom BEMVINDO10 aplicado."; subtotal R$ 100,00, desconto - R$ 10,00, frete R$ 19,90, total R$ 109,90 |
|  | BEMVINDO10[espaço][espaço] | Passou | "Cupom BEMVINDO10 aplicado."; subtotal R$ 100,00, desconto - R$ 10,00, frete R$ 19,90, total R$ 109,90 |
|  | [espaço]bemvindo10[espaço][espaço] | Passou | "Cupom BEMVINDO10 aplicado."; subtotal R$ 100,00, desconto - R$ 10,00, frete R$ 19,90, total R$ 109,90 |
| **CT-UI-02** Cupom inexistente é recusado | NAOEXISTE | Passou | mensagem "Cupom inválido."; subtotal R$ 100,00, desconto R$ 0,00, frete R$ 19,90, total R$ 119,90 |
|  | BEM VINDO10 | Passou | mensagem "Cupom inválido."; subtotal R$ 100,00, desconto R$ 0,00, frete R$ 19,90, total R$ 119,90 |
|  | BEMVINDO | Passou | mensagem "Cupom inválido."; subtotal R$ 100,00, desconto R$ 0,00, frete R$ 19,90, total R$ 119,90 |
|  | BEMVINDO15 | Passou | mensagem "Cupom inválido."; subtotal R$ 100,00, desconto R$ 0,00, frete R$ 19,90, total R$ 119,90 |
| **CT-UI-03** Cupom expirado é recusado | VERAO2026 | Passou | mensagem "Cupom expirado."; subtotal R$ 100,00, desconto R$ 0,00, frete R$ 19,90, total R$ 119,90 |
|  | [espaço]verao2026[espaço] | Passou | mensagem "Cupom expirado."; subtotal R$ 100,00, desconto R$ 0,00, frete R$ 19,90, total R$ 119,90 |
| **CT-UI-04** Com um cupom aplicado não é possível informar outro | - | Passou | "Cupom BEMVINDO10 aplicado."; campo de cupom some da tela; botão "Remover cupom" visível |
| **CT-UI-05** Remover o cupom zera o desconto e recalcula o total | - | Passou | nenhum cupom aplicado; campo de cupom visível; subtotal R$ 100,00, desconto R$ 0,00, frete R$ 19,90, total R$ 119,90 |
| **CT-UI-06** Trocar de cupom exige remover o atual antes | - | Passou | mensagem "Cupom expirado."; subtotal R$ 100,00, desconto R$ 0,00, frete R$ 19,90, total R$ 119,90 |
| **CT-UI-07** O desconto acompanha a mudança de quantidade | - | Passou | com 3 unidades: subtotal R$ 300,00, desconto - R$ 30,00, frete Grátis, total R$ 270,00. De volta a 1: subtotal R$ 100,00, desconto - R$ 10,00, frete R$ 19,90, total R$ 109,90 |
| **CT-UI-08** Aplicar com o campo de cupom vazio pede um código | - | Passou | mensagem "Informe um cupom."; subtotal R$ 100,00, desconto R$ 0,00, frete R$ 19,90, total R$ 119,90 |

### Frete grátis no carrinho

Arquivo: [`features/ui/frete.feature`](../features/ui/frete.feature)

| Cenário | Exemplo | Resultado | Obtido |
|---|---|---|---|
| **CT-UI-10** Abaixo de R$ 200,00 cobra frete fixo e informa quanto falta | 1x Kit 3 Pares de Meias | Passou | subtotal R$ 29,90, desconto R$ 0,00, frete R$ 19,90, total R$ 49,80; "Faltam R$ 170,10 para o frete grátis." |
|  | 1x Camiseta Essencial | Passou | subtotal R$ 59,90, desconto R$ 0,00, frete R$ 19,90, total R$ 79,80; "Faltam R$ 140,10 para o frete grátis." |
|  | 1x Tênis Casual Urbano | Passou | subtotal R$ 189,90, desconto R$ 0,00, frete R$ 19,90, total R$ 209,80; "Faltam R$ 10,10 para o frete grátis." |
|  | 1x Boné Aba Curva, 1x Mochila Urbana 20L, 1x Garrafa Térmica 750ml | Passou | subtotal R$ 199,90, desconto R$ 0,00, frete R$ 19,90, total R$ 219,80; "Faltam R$ 0,10 para o frete grátis." |
| **CT-UI-11** A partir de R$ 200,00 o frete é grátis | 3x Garrafa Térmica 750ml, 1x Camiseta Essencial | Passou | subtotal R$ 209,90, desconto R$ 0,00, frete Grátis, total R$ 209,90; sem aviso de valor faltante |
|  | 1x Jaqueta Corta-Vento | Passou | subtotal R$ 229,90, desconto R$ 0,00, frete Grátis, total R$ 229,90; sem aviso de valor faltante |
|  | 2x Mochila Urbana 20L | **Falhou** (BUG-01) | subtotal R$ 200,00, desconto R$ 0,00, frete R$ 19,90, total R$ 219,90; "Faltam R$ 0,00 para o frete grátis.". Esperado: frete Grátis, total R$ 200,00 e nenhum aviso de valor faltante |
|  | 4x Garrafa Térmica 750ml | **Falhou** (BUG-01) | subtotal R$ 200,00, desconto R$ 0,00, frete R$ 19,90, total R$ 219,90; "Faltam R$ 0,00 para o frete grátis.". Esperado: frete Grátis, total R$ 200,00 e nenhum aviso de valor faltante |
|  | 1x Mochila Urbana 20L, 2x Garrafa Térmica 750ml | **Falhou** (BUG-01) | subtotal R$ 200,00, desconto R$ 0,00, frete R$ 19,90, total R$ 219,90; "Faltam R$ 0,00 para o frete grátis.". Esperado: frete Grátis, total R$ 200,00 e nenhum aviso de valor faltante |
| **CT-UI-12** O frete grátis considera o subtotal antes do desconto | - | Passou | subtotal R$ 209,90, desconto - R$ 20,99, frete Grátis, total R$ 188,91; sem aviso de valor faltante |
| **CT-UI-13** Subtotal de exatamente R$ 200,00 com cupom mantém o frete grátis | - | **Falhou** (BUG-01) | subtotal R$ 200,00, desconto - R$ 20,00, frete R$ 19,90, total R$ 199,90; "Faltam R$ 0,00 para o frete grátis.". Esperado: frete Grátis, total R$ 180,00 e nenhum aviso de valor faltante |
| **CT-UI-14** O desconto do cupom não incide sobre o frete | 1x Mochila Urbana 20L | Passou | subtotal R$ 100,00, desconto - R$ 10,00, frete R$ 19,90, total R$ 109,90 |
|  | 1x Boné Aba Curva, 1x Mochila Urbana 20L, 1x Garrafa Térmica 750ml | Passou | subtotal R$ 199,90, desconto - R$ 19,99, frete R$ 19,90, total R$ 199,81 |
| **CT-UI-15** O frete muda quando o carrinho cruza o limite nos dois sentidos | - | Passou | com 1 unidade: frete R$ 19,90, total R$ 159,80, "Faltam R$ 60,10 para o frete grátis." Com 2: frete Grátis, total R$ 279,80, sem aviso. De volta a 1: frete R$ 19,90, total R$ 159,80, aviso de volta |
| **CT-UI-16** Os valores da tela são os mesmos calculados pela API | 3x Camiseta Essencial | Passou | tela: subtotal R$ 179,70, desconto - R$ 17,97, frete R$ 19,90, total R$ 181,63. API: 179.7, 17.97, 19.9, 181.63 |
|  | 1x Calça Jeans Slim, 2x Boné Aba Curva | Passou | tela: subtotal R$ 239,70, desconto - R$ 23,97, frete Grátis, total R$ 215,73. API: 239.7, 23.97, 0, 215.73 |
|  | 3x Kit 3 Pares de Meias, 1x Boné Aba Curva | Passou | tela: subtotal R$ 139,60, desconto - R$ 13,96, frete R$ 19,90, total R$ 145,54. API: 139.6, 13.96, 19.9, 145.54 |
| **CT-UI-17** Carrinho vazio não exibe resumo nem aviso de frete | - | Passou | título "Seu carrinho está vazio"; sem resumo e sem aviso de frete |

### Limite de 5 unidades por produto na interface

Arquivo: [`features/ui/limite-quantidade.feature`](../features/ui/limite-quantidade.feature)

| Cenário | Exemplo | Resultado | Obtido |
|---|---|---|---|
| **CT-UI-20** O carrinho permite aumentar até 5 unidades e bloqueia a sexta | - | Passou | quantidade 5; total do item R$ 250,00; botão + desabilitado; aviso "Limite de 5 unidades por produto." |
| **CT-UI-21** A vitrine bloqueia o produto depois de 5 unidades adicionadas | - | Passou | aviso "Limite de 5 unidades atingido."; botão "Adicionar ao carrinho" desabilitado; contador do carrinho em 5 |
| **CT-UI-22** O limite vale por produto, não pelo carrinho inteiro | - | Passou | quantidades 5 e 5; subtotal R$ 399,50, desconto R$ 0,00, frete Grátis, total R$ 399,50 |
| **CT-UI-23** A quantidade mínima no carrinho é 1 | - | Passou | quantidade 1; botão - desabilitado |
| **CT-UI-24** Remover um item recalcula o resumo | - | Passou | subtotal R$ 49,90, desconto R$ 0,00, frete R$ 19,90, total R$ 69,80; "Faltam R$ 150,10 para o frete grátis." |
| **CT-UI-25** Esvaziar o carrinho remove todos os itens | - | Passou | título "Seu carrinho está vazio"; contador do carrinho em 0 |

### Finalização da compra

Arquivo: [`features/ui/checkout.feature`](../features/ui/checkout.feature)

| Cenário | Exemplo | Resultado | Obtido |
|---|---|---|---|
| **CT-UI-30** Pedido com cupom é confirmado com os valores do carrinho | - | Passou | finalização e confirmação com subtotal R$ 100,00, desconto - R$ 10,00, frete R$ 19,90, total R$ 109,90; "Pedido confirmado"; número no formato VZ-000000; "Obrigado, Maria." |
| **CT-UI-31** Pedido com frete grátis e CEP sem hífen é confirmado | - | Passou | página de pedido confirmado; número no formato VZ-000000; subtotal R$ 229,90, desconto R$ 0,00, frete Grátis, total R$ 229,90 |
| **CT-UI-32** Dados inválidos do cliente impedem o pedido | nome sem sobrenome | Passou | "Informe nome e sobrenome." no campo Nome completo; continua na finalização |
|  | nome vazio | Passou | "Informe o nome completo." no campo Nome completo; continua na finalização |
|  | e-mail sem arroba | Passou | "Informe um e-mail válido." no campo E-mail; continua na finalização |
|  | e-mail sem domínio | Passou | "Informe um e-mail válido." no campo E-mail; continua na finalização |
|  | e-mail vazio | Passou | "Informe o e-mail." no campo E-mail; continua na finalização |
|  | CEP com 7 dígitos | Passou | "Informe um CEP com 8 dígitos." no campo CEP; continua na finalização |
|  | CEP com 9 dígitos | Passou | "Informe um CEP com 8 dígitos." no campo CEP; continua na finalização |
|  | CEP com letras | Passou | "Informe um CEP com 8 dígitos." no campo CEP; continua na finalização |
|  | CEP vazio | Passou | "Informe o CEP." no campo CEP; continua na finalização |
| **CT-UI-33** Todos os campos inválidos são apontados de uma vez | - | Passou | "Informe nome e sobrenome.", "Informe um e-mail válido." e "Informe um CEP com 8 dígitos." exibidos juntos; continua na finalização |
| **CT-UI-34** Não é possível finalizar a compra com o carrinho vazio | - | Passou | redireciona para o carrinho, com o título "Seu carrinho está vazio" |

## Resultados da API

Os valores aparecem como a API devolve: número em reais, como 59.9 para R$ 59,90.

### Cálculo do carrinho pela API

Arquivo: [`features/api/carrinho-calculo.feature`](../features/api/carrinho-calculo.feature)

| Cenário | Exemplo | Resultado | Obtido |
|---|---|---|---|
| **CT-API-01** Cálculo sem cupom | 1x P006 | Passou | 200; subtotal 29.9, desconto 0, frete 19.9, faltante 170.1, total 49.8, freteGratis false |
|  | 1x P005 | Passou | 200; subtotal 100, desconto 0, frete 19.9, faltante 100, total 119.9, freteGratis false |
|  | 3x P001 | Passou | 200; subtotal 179.7, desconto 0, frete 19.9, faltante 20.3, total 199.6, freteGratis false |
|  | 1x P004, 1x P005, 1x P008 | Passou | 200; subtotal 199.9, desconto 0, frete 19.9, faltante 0.1, total 219.8, freteGratis false |
|  | 3x P008, 1x P001 | Passou | 200; subtotal 209.9, desconto 0, frete 0, faltante 0, total 209.9, freteGratis true |
|  | 1x P007 | Passou | 200; subtotal 229.9, desconto 0, frete 0, faltante 0, total 229.9, freteGratis true |
|  | 5x P005 | Passou | 200; subtotal 500, desconto 0, frete 0, faltante 0, total 500, freteGratis true |
|  | 2x P005 | **Falhou** (BUG-01) | 200; subtotal 200, desconto 0, frete 19.9, faltante 0, total 219.9, freteGratis false. Esperado: frete 0, total 200, freteGratis true |
|  | 4x P008 | **Falhou** (BUG-01) | 200; subtotal 200, desconto 0, frete 19.9, faltante 0, total 219.9, freteGratis false. Esperado: frete 0, total 200, freteGratis true |
|  | 1x P005, 2x P008 | **Falhou** (BUG-01) | 200; subtotal 200, desconto 0, frete 19.9, faltante 0, total 219.9, freteGratis false. Esperado: frete 0, total 200, freteGratis true |
| **CT-API-02** Cálculo com o cupom BEMVINDO10 | 1x P005 | Passou | 200; subtotal 100, desconto 10, frete 19.9, faltante 100, total 109.9 |
|  | 1x P006 | Passou | 200; subtotal 29.9, desconto 2.99, frete 19.9, faltante 170.1, total 46.81 |
|  | 3x P001 | Passou | 200; subtotal 179.7, desconto 17.97, frete 19.9, faltante 20.3, total 181.63 |
|  | 1x P004, 1x P005, 1x P008 | Passou | 200; subtotal 199.9, desconto 19.99, frete 19.9, faltante 0.1, total 199.81 |
|  | 3x P008, 1x P001 | Passou | 200; subtotal 209.9, desconto 20.99, frete 0, faltante 0, total 188.91 |
|  | 1x P002, 2x P004 | Passou | 200; subtotal 239.7, desconto 23.97, frete 0, faltante 0, total 215.73 |
|  | 5x de cada um dos 8 produtos | Passou | 200; subtotal 4247, desconto 424.7, frete 0, faltante 0, total 3822.3 |
|  | 2x P005 | **Falhou** (BUG-01) | 200; subtotal 200, desconto 20, frete 19.9, faltante 0, total 199.9. Esperado: frete 0, total 180 |
| **CT-API-03** O cupom é aceito sem diferenciar maiúsculas e ignorando espaços nas pontas | bemvindo10 | Passou | 200; cupom BEMVINDO10 aplicado; desconto 10, total 109.9 |
|  | BemVindo10 | Passou | 200; cupom BEMVINDO10 aplicado; desconto 10, total 109.9 |
|  | [espaço][espaço]BEMVINDO10 | Passou | 200; cupom BEMVINDO10 aplicado; desconto 10, total 109.9 |
|  | BEMVINDO10[espaço][espaço] | Passou | 200; cupom BEMVINDO10 aplicado; desconto 10, total 109.9 |
|  | [espaço]bemvindo10[espaço][espaço] | Passou | 200; cupom BEMVINDO10 aplicado; desconto 10, total 109.9 |
| **CT-API-04** No cálculo, cupom inválido ou expirado não gera erro e não dá desconto | NAOEXISTE | Passou | 200; cupom não aplicado, "Cupom inválido."; desconto 0, total 119.9 |
|  | BEM VINDO10 | Passou | 200; cupom não aplicado, "Cupom inválido."; desconto 0, total 119.9 |
|  | VERAO2026 | Passou | 200; cupom não aplicado, "Cupom expirado."; desconto 0, total 119.9 |
|  | [espaço]verao2026[espaço] | Passou | 200; cupom não aplicado, "Cupom expirado."; desconto 0, total 119.9 |
| **CT-API-05** O cálculo aceita de 1 a 5 unidades por produto | 1 | Passou | 200; subtotal 50, total 69.9 |
|  | 5 | Passou | 200; subtotal 250, total 250 |
| **CT-API-06** O cálculo recusa mais de 5 unidades por produto | 6 | **Falhou** (BUG-02) | 200; subtotal 300, total 300. Esperado: 422 QUANTIDADE_MAXIMA_EXCEDIDA |
|  | 10 | **Falhou** (BUG-02) | 200; subtotal 500, total 500. Esperado: 422 QUANTIDADE_MAXIMA_EXCEDIDA |
| **CT-API-07** O cálculo recusa a quantidade inválida | 0 | Passou | 422 QUANTIDADE_INVALIDA, campo itens[0].quantidade |
|  | -1 | Passou | 422 QUANTIDADE_INVALIDA, campo itens[0].quantidade |
|  | 1.5 | Passou | 422 QUANTIDADE_INVALIDA, campo itens[0].quantidade |
|  | null | Passou | 422 QUANTIDADE_INVALIDA, campo itens[0].quantidade |
|  | "2" | Passou | 422 QUANTIDADE_INVALIDA, campo itens[0].quantidade |
| **CT-API-08** O mesmo produto repetido na lista é recusado | - | Passou | 422 ITEM_DUPLICADO, campo itens[1].produtoId |

### Confirmação de pedido pela API

Arquivo: [`features/api/pedidos.feature`](../features/api/pedidos.feature)

| Cenário | Exemplo | Resultado | Obtido |
|---|---|---|---|
| **CT-API-20** Pedido válido com cupom é confirmado | - | Passou | 201; número no formato VZ-000000; subtotal 100, desconto 10, frete 19.9, faltante 100, total 109.9; CEP devolvido 01310100 |
| **CT-API-21** O pedido devolve o mesmo resumo do cálculo do carrinho | 1x P002, 2x P004 | Passou | 201; resumo igual ao do cálculo: subtotal 239.7, desconto 23.97, frete 0, total 215.73 |
|  | 3x P001 | Passou | 201; resumo igual ao do cálculo: subtotal 179.7, desconto 17.97, frete 19.9, total 181.63 |
|  | 1x P004, 1x P005, 1x P008 | Passou | 201; resumo igual ao do cálculo: subtotal 199.9, desconto 19.99, frete 19.9, total 199.81 |
| **CT-API-22** Pedido com subtotal de exatamente R$ 200,00 tem frete grátis | - | **Falhou** (BUG-01) | 201; subtotal 200, desconto 0, frete 19.9, faltante 0, total 219.9. Esperado: frete 0, total 200 |
| **CT-API-23** CEP com 8 dígitos é aceito | 01310-100 | Passou | 201; CEP devolvido 01310100 |
|  | 01310100 | Passou | 201; CEP devolvido 01310100 |
| **CT-API-24** Pedido é recusado com dado inválido do cliente | nome sem sobrenome | Passou | 422 DADOS_INVALIDOS, campos cliente.nome, "Informe nome e sobrenome." |
|  | nome vazio | Passou | 422 DADOS_INVALIDOS, campos cliente.nome, "Informe o nome completo." |
|  | e-mail sem arroba | Passou | 422 DADOS_INVALIDOS, campos cliente.email, "Informe um e-mail válido." |
|  | e-mail sem domínio | Passou | 422 DADOS_INVALIDOS, campos cliente.email, "Informe um e-mail válido." |
|  | e-mail sem extensão | Passou | 422 DADOS_INVALIDOS, campos cliente.email, "Informe um e-mail válido." |
|  | e-mail com espaço | Passou | 422 DADOS_INVALIDOS, campos cliente.email, "Informe um e-mail válido." |
|  | e-mail vazio | Passou | 422 DADOS_INVALIDOS, campos cliente.email, "Informe o e-mail." |
|  | CEP com 7 dígitos | Passou | 422 DADOS_INVALIDOS, campos cliente.cep, "Informe um CEP com 8 dígitos." |
|  | CEP com 9 dígitos | Passou | 422 DADOS_INVALIDOS, campos cliente.cep, "Informe um CEP com 8 dígitos." |
|  | CEP com letras | Passou | 422 DADOS_INVALIDOS, campos cliente.cep, "Informe um CEP com 8 dígitos." |
|  | CEP vazio | Passou | 422 DADOS_INVALIDOS, campos cliente.cep, "Informe o CEP." |
| **CT-API-25** Vários dados inválidos são listados de uma vez | - | Passou | 422 DADOS_INVALIDOS, campos cliente.nome, cliente.email e cliente.cep |
| **CT-API-26** Pedido com cupom inválido ou expirado é recusado | NAOEXISTE | Passou | 422 CUPOM_INVALIDO, campo cupom |
|  | BEM VINDO10 | Passou | 422 CUPOM_INVALIDO, campo cupom |
|  | VERAO2026 | Passou | 422 CUPOM_EXPIRADO, campo cupom |
|  | [espaço]verao2026[espaço] | Passou | 422 CUPOM_EXPIRADO, campo cupom |
| **CT-API-27** Pedido com 5 unidades do mesmo produto é aceito | - | Passou | 201; subtotal 250, total 250 |
| **CT-API-28** Pedido com mais de 5 unidades do mesmo produto é recusado | 6 | **Falhou** (BUG-02) | 201, pedido confirmado; subtotal 300, total 300. Esperado: 422 QUANTIDADE_MAXIMA_EXCEDIDA |
|  | 10 | **Falhou** (BUG-02) | 201, pedido confirmado; subtotal 500, total 500. Esperado: 422 QUANTIDADE_MAXIMA_EXCEDIDA |
| **CT-API-29** Pedido com a quantidade inválida é recusado | 0 | Passou | 422 QUANTIDADE_INVALIDA, campo itens[0].quantidade |
|  | -1 | Passou | 422 QUANTIDADE_INVALIDA, campo itens[0].quantidade |
|  | 1.5 | Passou | 422 QUANTIDADE_INVALIDA, campo itens[0].quantidade |
| **CT-API-30** Pedido com o mesmo produto repetido é recusado | - | Passou | 422 ITEM_DUPLICADO, campo itens[1].produtoId |
| **CT-API-31** Pedido sem itens é recusado | - | Passou | 422 ITENS_OBRIGATORIOS, campo itens |

### Catálogo de produtos e códigos de erro da API

Arquivo: [`features/api/contrato-erros.feature`](../features/api/contrato-erros.feature)

| Cenário | Exemplo | Resultado | Obtido |
|---|---|---|---|
| **CT-API-40** A lista de produtos traz os 8 produtos e os preços da documentação | - | Passou | 200; 8 produtos, com ids, nomes e preços iguais aos da documentação |
| **CT-API-41** Consulta de um produto existente | - | Passou | 200; Camiseta Essencial, preço 59.9 |
| **CT-API-42** Consulta de um produto inexistente | - | Passou | 404 PRODUTO_NAO_ENCONTRADO |
| **CT-API-43** Corpo que não é um objeto JSON válido é recusado | JSON malformado | Passou | 400 JSON_INVALIDO |
|  | lista no lugar do objeto | Passou | 400 JSON_INVALIDO |
|  | texto no lugar do objeto | Passou | 400 JSON_INVALIDO |
|  | JSON malformado no pedido | Passou | 400 JSON_INVALIDO |
| **CT-API-44** Rota inexistente | - | Passou | 404 ROTA_NAO_ENCONTRADA |
| **CT-API-45** Método não aceito na rota | GET /api/pedidos | Passou | 405 METODO_NAO_PERMITIDO |
|  | GET /api/carrinho/calcular | Passou | 405 METODO_NAO_PERMITIDO |
|  | POST /api/produtos | Passou | 405 METODO_NAO_PERMITIDO |
| **CT-API-46** Lista de itens ausente ou vazia é recusada | itens ausente | Passou | 422 ITENS_OBRIGATORIOS, campo itens |
|  | itens vazio | Passou | 422 ITENS_OBRIGATORIOS, campo itens |
| **CT-API-47** Item que não é um objeto é recusado | - | Passou | 422 ITEM_INVALIDO, campo itens[0] |
| **CT-API-48** Item sem produtoId é recusado como item inválido | - | **Falhou** (BUG-03) | 422 PRODUTO_NAO_ENCONTRADO, campo itens[0].produtoId, "Produto undefined não encontrado.". Esperado: 422 ITEM_INVALIDO |
| **CT-API-49** Item sem quantidade é recusado | - | Passou | 422 QUANTIDADE_INVALIDA, campo itens[0].quantidade |
| **CT-API-50** Item com produto inexistente é recusado | - | Passou | 422 PRODUTO_NAO_ENCONTRADO, campo itens[0].produtoId |
| **CT-API-51** Todo erro traz código e mensagem | rota inexistente | Passou | 404 ROTA_NAO_ENCONTRADA, "Rota não encontrada." |
|  | produto inexistente | Passou | 404 PRODUTO_NAO_ENCONTRADO, "Produto P999 não encontrado." |
|  | método não permitido | Passou | 405 METODO_NAO_PERMITIDO, "O método GET não é permitido nesta rota." |
|  | corpo ausente | Passou | 400 JSON_INVALIDO, "O corpo da requisição deve ser um objeto JSON válido." |

## Testes exploratórios

Feitos fora do roteiro dos cenários, na mesma data e no mesmo ambiente.

| # | O que foi testado | Resultado observado | Conclusão |
|---|---|---|---|
| EXP-01 | Vitrine comparada com a tabela de produtos da documentação | Os 8 produtos aparecem com os nomes e preços documentados | Conforme |
| EXP-02 | Recarregar a página do carrinho com 1 Mochila, 1 Garrafa e o cupom BEMVINDO10 aplicado | Itens, cupom e valores continuam iguais: subtotal R$ 150,00, desconto - R$ 15,00, total R$ 154,90 | Conforme. O carrinho fica guardado na aba, como descrito em "Sobre este ambiente" |
| EXP-03 | Aplicar o cupom, remover o único item pelo botão "Remover" e adicionar outro produto | O carrinho novo já abre com o cupom aplicado: 1 Garrafa com desconto - R$ 5,00 e total R$ 64,90. "Esvaziar carrinho" remove o cupom, "Remover" do último item não | Observação. Os dois caminhos para zerar o carrinho se comportam de forma diferente e a documentação não cobre o caso. Vale confirmar com o time |
| EXP-04 | Recarregar a página de pedido confirmado | Continua exibindo o último pedido. O carrinho fica vazio depois da confirmação | Conforme |
| EXP-05 | Cupom vazio (`""`) e só com espaços (`"   "`) na API | Vazio: tratado como sem cupom, no cálculo e no pedido (201). Só espaços: "Cupom inválido." no cálculo e 422 `CUPOM_INVALIDO` no pedido | Observação. Ver [`ambiguidades.md`](ambiguidades.md), item 2 |
| EXP-06 | Cupom com tabulação e quebra de linha nas pontas | Aceito e aplicado como BEMVINDO10 | Conforme com CA02 |
| EXP-07 | `produtoId` em minúsculas (`p005`) | 422 `PRODUTO_NAO_ENCONTRADO` | Observação. O id do produto diferencia maiúsculas de minúsculas e a documentação não diz se deveria |
| EXP-08 | Quantidade 100 no cálculo do carrinho | 200, com total 2990 | Reforça o BUG-02: não existe limite superior na API |
| EXP-09 | CEP com espaços nas pontas e com hífen fora da posição (`0131-0100`) | Com espaços: aceito (201). Hífen fora da posição: 422 `DADOS_INVALIDOS` | Ver [`ambiguidades.md`](ambiguidades.md), item 4 |
| EXP-10 | Sobrenome de uma letra ("Maria S") e e-mail em maiúsculas | "Maria S": 422 `DADOS_INVALIDOS`. E-mail em maiúsculas: aceito (201) | Ver [`ambiguidades.md`](ambiguidades.md), item 9 |
| EXP-11 | Pedido com mais de um problema ao mesmo tempo | Cliente inválido com item inválido: `DADOS_INVALIDOS`. Item inválido com cupom inválido: `PRODUTO_NAO_ENCONTRADO`. Cliente inválido com cupom inválido: `DADOS_INVALIDOS` | A API valida cliente, depois itens, depois cupom. Ver [`ambiguidades.md`](ambiguidades.md), item 8 |
| EXP-12 | JSON válido enviado com `Content-Type: text/plain` | 200, calculado normalmente | Observação. A documentação pede `application/json`, e a API aceita o corpo mesmo sem esse cabeçalho |
