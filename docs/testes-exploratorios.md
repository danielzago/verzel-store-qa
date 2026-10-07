# Testes exploratórios manuais

Roteiro de testes feitos à mão, fora dos cenários automatizados, para procurar o que a documentação não previu: combinações de ações, uso pelo teclado, recarregar a página, dados fora do comum e chamadas diretas à API.

| | |
|---|---|
| Entrega testada | VZS-142, cupom de desconto e frete grátis, versão 2.3.0 |
| Ambiente | https://verzel-store.qa-test-verzel-store.workers.dev/ |
| Data da execução | 06/10/2026 |
| Resultados e prints | Planilha e pasta `prints/` em [`testes-exploratorios/`](testes-exploratorios/) |

## Como executar

1. Abra a loja em uma aba nova. Cada cenário começa com o carrinho vazio: use "Esvaziar carrinho" entre um cenário e outro.
2. Siga os passos e compare com o resultado esperado.
3. Tire um print do momento indicado em cada cenário e salve em `docs/testes-exploratorios/prints/` com o nome do cenário, por exemplo `TE-01.png`. No Windows, `Win + Shift + S` recorta a tela.
4. Anote o resultado na planilha `docs/testes-exploratorios/testes-exploratorios.xlsx`.

Quando a documentação não cobre o caso, o cenário pede para **registrar o comportamento** no lugar de dar um resultado esperado. O objetivo ali é documentar o que a loja faz e levar a dúvida ao time.

Para os cenários de API, use qualquer cliente HTTP (Postman, Insomnia ou a extensão REST Client do VS Code). O print é da tela do cliente com a requisição e a resposta.

## Sessão 1: cupom no carrinho

Missão: explorar o cupom em sequências de ações que os critérios de aceite não descrevem.

### TE-01 | Aplicar o cupom pela tecla Enter

- **Passos**
  1. Adicionar 1 Mochila Urbana 20L e abrir o Carrinho.
  2. Clicar no campo "Cupom de desconto", digitar `BEMVINDO10` e apertar Enter, sem usar o mouse.
- **Resultado esperado**: o cupom é aplicado como se o botão "Aplicar cupom" fosse clicado. Desconto - R$ 10,00 e total R$ 109,90.
- **Print**: carrinho com o cupom aplicado.

### TE-02 | Corrigir o cupom depois de um erro

- **Passos**
  1. Adicionar 1 Mochila Urbana 20L e abrir o Carrinho.
  2. Aplicar o cupom `NAOEXISTE`.
  3. Sem recarregar a página, apagar o campo, digitar `bemvindo10` e aplicar.
- **Resultado esperado**: no passo 2 aparece "Cupom inválido." e o total continua R$ 119,90. No passo 3 a mensagem de erro some, aparece "Cupom BEMVINDO10 aplicado." e o total passa a R$ 109,90.
- **Print**: um do erro e um do cupom aplicado (`TE-02-a.png` e `TE-02-b.png`).

### TE-03 | Cupom depois de remover o último item

- **Passos**
  1. Adicionar 1 Mochila Urbana 20L, abrir o Carrinho e aplicar `BEMVINDO10`.
  2. Clicar em "Remover" na linha da mochila. O carrinho fica vazio.
  3. Voltar à vitrine, adicionar 1 Garrafa Térmica 750ml e abrir o Carrinho.
  4. Repetir os passos 1 a 3 usando "Esvaziar carrinho" no lugar de "Remover".
- **Registrar o comportamento**: o carrinho novo abre com o cupom já aplicado ou sem cupom? Os dois caminhos se comportam igual? A documentação não cobre este caso. CA05 só diz que o cliente remove o cupom para trocar.
- **Print**: o carrinho novo em cada um dos dois caminhos (`TE-03-a.png` e `TE-03-b.png`).

### TE-04 | Cupom ao recarregar a página e ao ir e voltar da finalização

- **Passos**
  1. Adicionar 1 Mochila Urbana 20L e 1 Garrafa Térmica 750ml, abrir o Carrinho e aplicar `BEMVINDO10`.
  2. Recarregar a página (F5).
  3. Clicar em "Finalizar compra" e depois em "Voltar ao carrinho".
- **Resultado esperado**: nos passos 2 e 3 os itens, o cupom e os valores continuam os mesmos: subtotal R$ 150,00, desconto - R$ 15,00, frete R$ 19,90 e total R$ 154,90. O carrinho fica guardado na aba, como descrito em "Sobre este ambiente".
- **Print**: carrinho depois do F5.

## Sessão 2: frete e valores

Missão: explorar o cálculo em volta do limite de R$ 200,00 e com valores altos.

### TE-05 | Cruzar o limite do frete grátis com cupom aplicado

- **Passos**
  1. Adicionar 1 Tênis Casual Urbano, abrir o Carrinho e aplicar `BEMVINDO10`.
  2. Voltar à vitrine, adicionar 1 Kit 3 Pares de Meias e abrir o Carrinho.
  3. Remover o Kit 3 Pares de Meias.
- **Resultado esperado**

  | Passo | Subtotal | Desconto | Frete | Total | Aviso |
  |---|---|---|---|---|---|
  | 1 | R$ 189,90 | - R$ 18,99 | R$ 19,90 | R$ 190,81 | "Faltam R$ 10,10 para o frete grátis." |
  | 2 | R$ 219,80 | - R$ 21,98 | Grátis | R$ 197,82 | Nenhum |
  | 3 | R$ 189,90 | - R$ 18,99 | R$ 19,90 | R$ 190,81 | "Faltam R$ 10,10 para o frete grátis." |

  No passo 2 o valor pago fica abaixo de R$ 200,00 e o frete continua grátis, porque a regra olha o subtotal antes do desconto (CA08).
- **Print**: carrinho no passo 2.

### TE-06 | Subtotal de exatamente R$ 200,00, montado à mão

- **Passos**
  1. Adicionar 2 Mochilas Urbanas 20L e abrir o Carrinho.
  2. Esvaziar e repetir com 4 Garrafas Térmicas 750ml.
  3. Esvaziar e repetir com 1 Mochila Urbana 20L e 2 Garrafas Térmicas 750ml.
- **Resultado esperado**: subtotal R$ 200,00, frete Grátis, total R$ 200,00 e nenhum aviso de valor faltante (CA06).
- **Resultado conhecido**: falha. É o [BUG-01](bugs.md#bug-01): a loja cobra R$ 19,90 e mostra "Faltam R$ 0,00 para o frete grátis."
- **Print**: carrinho de cada combinação (`TE-06-a.png`, `TE-06-b.png` e `TE-06-c.png`).

### TE-07 | Carrinho no máximo: 5 unidades de cada um dos 8 produtos

- **Passos**
  1. Adicionar 5 unidades de cada produto da vitrine e abrir o Carrinho.
  2. Aplicar `BEMVINDO10`.
  3. Clicar em "Finalizar compra".
- **Resultado esperado**: contador do carrinho em 40. Subtotal R$ 4.247,00, com ponto de milhar. Com o cupom, desconto - R$ 424,70, frete Grátis e total R$ 3.822,30. Na finalização, as 8 linhas de itens aparecem com os mesmos valores, sem texto cortado ou sobreposto.
- **Print**: carrinho com o cupom e a tela de finalização (`TE-07-a.png` e `TE-07-b.png`).

## Sessão 3: quantidade

Missão: tentar passar do limite de 5 unidades por caminhos diferentes do botão +.

### TE-08 | O limite de 5 unidades resiste a recarregar e a trocar de página

- **Passos**
  1. Na vitrine, adicionar 5 unidades do Boné Aba Curva.
  2. Recarregar a página (F5) e tentar adicionar mais uma unidade.
  3. Abrir o Carrinho, voltar à vitrine e tentar de novo.
  4. No Carrinho, tentar clicar no botão + do boné.
- **Resultado esperado**: em todos os passos o produto continua com 5 unidades. Na vitrine o botão "Adicionar ao carrinho" fica desabilitado, com "Limite de 5 unidades atingido.". No carrinho o botão + fica desabilitado, com "Limite de 5 unidades por produto." (CA10).
- **Print**: vitrine depois do F5.

### TE-09 | O contador do carrinho soma unidades, não produtos

- **Passos**
  1. Adicionar 3 Camisetas Essenciais e 2 Bonés Aba Curva.
  2. Abrir o Carrinho e diminuir a camiseta para 1 unidade.
- **Resultado esperado**: no passo 1 o contador mostra 5 e o subtotal é R$ 279,50. No passo 2 o contador mostra 3, o subtotal passa a R$ 159,70 e o frete volta a R$ 19,90.
- **Print**: carrinho no passo 2.

## Sessão 4: finalização da compra

Missão: explorar o formulário com dados reais de cliente e com ações fora da ordem.

### TE-10 | Nome com acentos, apóstrofo e espaços a mais

- **Passos**
  1. Adicionar 1 Mochila Urbana 20L e ir até a finalização.
  2. Preencher o nome com espaços no início, no meio e no fim: `  José   Antônio D'Ávila  `. E-mail `jose@exemplo.com` e CEP `01310100`.
  3. Confirmar o pedido.
- **Resultado esperado**: o pedido é confirmado e a tela agradece com "Obrigado, José.". Acentos e apóstrofo não quebram a tela.
- **Print**: tela de pedido confirmado.

### TE-11 | Dados digitados ao sair da finalização e voltar

- **Passos**
  1. Adicionar 1 Mochila Urbana 20L e ir até a finalização.
  2. Preencher nome, e-mail e CEP, sem confirmar.
  3. Clicar em "Voltar ao carrinho" e depois em "Finalizar compra".
- **Registrar o comportamento**: os dados digitados continuam no formulário ou somem? A documentação não cobre. Se somem, é uma observação de usabilidade para levar ao time.
- **Print**: formulário depois de voltar.

### TE-12 | Duplo clique em "Confirmar pedido"

- **Passos**
  1. Adicionar 1 Mochila Urbana 20L, ir até a finalização e preencher dados válidos.
  2. Abrir as ferramentas do desenvolvedor (F12), aba Rede.
  3. Dar um duplo clique rápido em "Confirmar pedido".
- **Resultado esperado**: uma única requisição `POST /api/pedidos` na aba Rede e uma única tela de pedido confirmado. Enquanto o pedido é enviado, o botão fica indisponível.
- **Print**: aba Rede com a requisição ao lado da tela de confirmação.

### TE-13 | Botão voltar do navegador depois de confirmar o pedido

- **Passos**
  1. Concluir um pedido válido até a tela de pedido confirmado.
  2. Clicar no botão voltar do navegador.
- **Resultado esperado**: a loja não reenvia o pedido nem reabre o formulário preenchido. O carrinho aparece vazio, com o contador em 0.
- **Print**: tela depois de voltar.

### TE-14 | Recarregar a tela de pedido confirmado

- **Passos**
  1. Concluir um pedido válido com o cupom `BEMVINDO10`.
  2. Na tela de pedido confirmado, recarregar a página (F5).
- **Resultado esperado**: o mesmo número de pedido e os mesmos valores continuam na tela. Nenhum pedido novo é criado.
- **Print**: tela depois do F5.

### TE-15 | Corrigir um campo inválido e confirmar

- **Passos**
  1. Adicionar 1 Mochila Urbana 20L e ir até a finalização.
  2. Preencher nome `Maria`, e-mail `maria@exemplo.com` e CEP `01310-100` e confirmar.
  3. Corrigir o nome para `Maria Silva` e confirmar de novo.
- **Resultado esperado**: no passo 2 aparece "Informe nome e sobrenome." e os outros campos continuam preenchidos. No passo 3 o erro some e o pedido é confirmado.
- **Print**: um do erro e um da confirmação (`TE-15-a.png` e `TE-15-b.png`).

### TE-16 | Formatos de CEP

- **Passos**: na finalização, com nome e e-mail válidos, tentar confirmar com cada CEP abaixo.

  | CEP digitado | Resultado esperado |
  |---|---|
  | `01310-100` | Aceito |
  | `01310100` | Aceito |
  | `0131-0100` (hífen fora da posição) | "Informe um CEP com 8 dígitos." |
  | `01.310-100` (com ponto) | "Informe um CEP com 8 dígitos." |
  | ` 01310-100 ` (espaços nas pontas) | Registrar o comportamento |

- **Observação**: a documentação diz "8 dígitos, com ou sem hífen" e não fala de espaços nem da posição do hífen. Ver [`ambiguidades.md`](ambiguidades.md), item 4.
- **Print**: o erro do CEP com hífen fora da posição.

## Sessão 5: navegação e ambiente

Missão: explorar a loja fora do caminho feliz de navegação.

### TE-17 | Endereço que não existe

- **Passos**
  1. Abrir `https://verzel-store.qa-test-verzel-store.workers.dev/pagina-inexistente`.
- **Resultado esperado**: a loja mostra "Página não encontrada", com um caminho de volta para os produtos, e não uma tela em branco.
- **Print**: a página exibida.

### TE-18 | Carrinho em outra aba e em janela anônima

- **Passos**
  1. Adicionar 2 produtos ao carrinho.
  2. Abrir a loja em uma aba nova e depois em uma janela anônima.
- **Resultado esperado**: a aba nova e a janela anônima começam com o carrinho vazio, e a aba original continua com os 2 produtos. Isso é esperado e **não é bug**: está descrito em "Sobre este ambiente". O cenário existe para confirmar que o comportamento é o documentado.
- **Print**: as duas abas lado a lado.

### TE-19 | Tela estreita, como a de um celular

- **Passos**
  1. Abrir as ferramentas do desenvolvedor (F12) e ativar o modo de dispositivo, com largura de 375 px.
  2. Adicionar 3 produtos, abrir o Carrinho, aplicar `BEMVINDO10` e ir até a finalização.
- **Resultado esperado**: todos os botões, valores e mensagens ficam visíveis e clicáveis, sem conteúdo cortado e sem barra de rolagem horizontal.
- **Print**: carrinho e finalização na largura de 375 px (`TE-19-a.png` e `TE-19-b.png`).

### TE-20 | Compra inteira só com o teclado

- **Passos**
  1. Sem usar o mouse, navegar com Tab e ativar com Enter: adicionar um produto, abrir o Carrinho, aplicar `BEMVINDO10`, ir até a finalização, preencher os dados e confirmar.
- **Resultado esperado**: é possível concluir a compra. O foco fica sempre visível e segue a ordem da tela.
- **Print**: um momento com o foco visível em um botão.

## Sessão 6: API chamada direto

Missão: enviar à API requisições que a interface nunca enviaria e conferir se as regras continuam valendo. Uma requisição por vez, sem teste de carga nem de segurança, que estão fora do escopo.

### TE-21 | Campos de preço enviados no item

- **Passos**

  ```http
  POST /api/carrinho/calcular
  Content-Type: application/json

  { "itens": [ { "produtoId": "P005", "quantidade": 1, "preco": 1, "precoUnitario": 0.01, "total": 0.01 } ] }
  ```
- **Resultado esperado**: a API ignora os valores enviados e usa o preço do catálogo: `precoUnitario` 100, `subtotal` 100 e `total` 119.9.
- **Print**: requisição e resposta.

### TE-22 | Campos de valores enviados no pedido

- **Passos**

  ```http
  POST /api/pedidos
  Content-Type: application/json

  {
    "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310-100" },
    "itens": [ { "produtoId": "P005", "quantidade": 1 } ],
    "subtotal": 1, "desconto": 99, "frete": 0, "total": 1, "freteGratis": true
  }
  ```
- **Resultado esperado**: `201`, com os valores calculados pela API: `subtotal` 100, `desconto` 0, `frete` 19.9 e `total` 119.9.
- **Print**: requisição e resposta.

### TE-23 | Quantidade acima do limite, direto na API

- **Passos**: enviar `POST /api/pedidos` com 1 item do produto `P008`, trocando a quantidade por 6, 100 e 1000000.
- **Resultado esperado**: `422` com `QUANTIDADE_MAXIMA_EXCEDIDA` nos três casos (CA10).
- **Resultado conhecido**: falha. É o [BUG-02](bugs.md#bug-02): a API confirma o pedido com qualquer quantidade.
- **Print**: requisição e resposta da quantidade 6.

### TE-24 | Métodos que a API não aceita

- **Passos**: enviar `PUT /api/pedidos`, `DELETE /api/pedidos`, `PATCH /api/carrinho/calcular` e `DELETE /api/produtos/P001`.
- **Resultado esperado**: `405` com `METODO_NAO_PERMITIDO` em todos.
- **Print**: uma das respostas.

### TE-25 | Nome do cliente só com números

- **Passos**: enviar `POST /api/pedidos` com um item válido e o nome `12 34`.
- **Registrar o comportamento**: o pedido é aceito ou recusado? A documentação só exige "nome e sobrenome" e não diz se números contam como nome.
- **Print**: requisição e resposta.

## Registro dos resultados

O resultado de cada cenário, com a descrição do que aconteceu, está na planilha [`testes-exploratorios.xlsx`](testes-exploratorios/testes-exploratorios.xlsx). Os prints estão em [`testes-exploratorios/prints/`](testes-exploratorios/prints/), com o nome do cenário.
