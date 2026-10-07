# Ambiguidades da documentação e interpretação adotada

Card VZS-142, versão 2.3.0. Cada item traz o que a documentação diz, o que a loja faz hoje e a interpretação usada nos cenários.

| # | Ponto | O que a documentação diz | Comportamento observado em 06/10/2026 | Interpretação adotada |
|---|---|---|---|---|
| 1 | Modo de arredondamento (CA11) | "Todos os valores são arredondados para 2 casas decimais", sem dizer o modo. | Com os preços e o cupom disponíveis, nenhum cálculo gera terceira casa decimal real. | Não é possível distinguir os modos com a massa atual. Os cenários conferem que nenhum valor sai com mais de 2 casas (erro de ponto flutuante, como em 3 x 59,90). |
| 2 | Cupom vazio ou só com espaços | Não cobre. | Interface: "Informe um cupom." sem chamar a API. API com `""`: tratado como sem cupom. API com `"   "`: "Cupom inválido." no cálculo e 422 `CUPOM_INVALIDO` no pedido. | Campo vazio não é tentativa de cupom, então a mensagem da interface é aceitável (CT-UI-08). A diferença entre `""` e `"   "` na API fica registrada como observação. |
| 3 | Quantidade enviada como texto (`"2"`) | "Número inteiro maior ou igual a 1." | 422 `QUANTIDADE_INVALIDA`. | Texto não é número, então a recusa está correta (CT-API-07). |
| 4 | Formato do CEP | "8 dígitos, com ou sem hífen." | Aceita `01310-100`, `01310100` e também com espaços nas pontas. Recusa hífen fora da posição (`0131-0100`), ponto (`01.310-100`) e CEP enviado como número. | O hífen só vale na posição padrão 00000-000. Espaços nas pontas aceitos são tolerância razoável. |
| 5 | Carrinho vazio | Não diz se exibe frete e valor faltante. | Exibe "Seu carrinho está vazio", sem resumo. | Sem itens não há pedido para resumir, então o comportamento é aceitável (CT-UI-17). |
| 6 | Item sem `produtoId` ou sem `quantidade` | `ITEM_INVALIDO`: "Um item não é um objeto com produtoId e quantidade." | Sem `quantidade`: `QUANTIDADE_INVALIDA`. Sem `produtoId`: `PRODUTO_NAO_ENCONTRADO` com a mensagem "Produto undefined não encontrado." | Sem `quantidade`, as duas leituras são defensáveis e o campo apontado está certo (CT-API-49). Sem `produtoId`, a mensagem expõe "undefined" e o código não descreve o problema, então foi tratado como bug (BUG-03, CT-API-48). |
| 7 | Formato do erro | "Todo erro segue o mesmo formato", com `codigo`, `mensagem` e `campo`. | Erros 400, 404 e 405 não trazem `campo`. `DADOS_INVALIDOS` traz `campos` (lista) no lugar de `campo`. | `campo` só faz sentido quando o erro é de um campo. Os cenários exigem `codigo` e `mensagem` em todo erro (CT-API-51) e `campo` nos erros de item e de cupom. |
| 8 | Vários erros na mesma requisição | Não define a ordem de validação. | A API valida primeiro os dados do cliente, depois os itens e por último o cupom, e devolve só o primeiro grupo com erro. Entre os itens, vale o primeiro erro encontrado. | Os cenários de erro enviam um problema por vez, para não depender da ordem. |
| 9 | "Nome e sobrenome" | "O nome do cliente precisa ter nome e sobrenome." | Exige duas palavras com pelo menos 2 letras cada. "Maria S" é recusado. | Abreviação não é sobrenome, então a recusa é aceitável. Vale confirmar com o time se sobrenomes de 1 letra devem passar. |
| 10 | Exibição do frete grátis | Regra de cálculo: "R$ 0,00 quando o subtotal é igual ou maior que R$ 200,00." | A tela mostra "Grátis" e a API devolve `0`. | "Grátis" é só a forma de exibir o valor zero. Os cenários de interface conferem "Grátis" e os de API conferem `0`. |
| 11 | Campo de quantidade | CA10 fala em "interface", sem dizer como a quantidade é informada. | A quantidade muda só pelos botões + e -. Não há campo de digitação. | Os casos de digitar 6, 0, -1 ou letras não se aplicam à interface e são cobertos pela API (CT-API-06, CT-API-07). |

## Fora do escopo, conforme o enunciado e a seção "Sobre este ambiente"

- Carrinho que não aparece em outra aba, outro navegador ou janela anônima.
- Pedidos não armazenados, número de pedido fictício e ausência de consulta de pedidos.
- E-mails não enviados e ausência de cobrança.
- Estoque, login, cadastro de clientes e pagamento online.
- Testes de carga, estresse e segurança.
