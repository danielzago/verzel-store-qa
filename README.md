# Teste técnico QA Júnior | Verzel Store

Validação da entrega VZS-142 (cupom de desconto e frete grátis) da [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/).

Os cenários estão escritos em Gherkin, em português, e são executados pelo Playwright por meio do [playwright-bdd](https://vitalets.github.io/playwright-bdd/). O mesmo arquivo `.feature` serve de documentação do cenário e de teste automatizado.

## Onde encontrar cada entrega

| Entrega | Onde está |
|---|---|
| Cenários de teste em Gherkin | [`features/`](features/) |
| Execução dos testes, com o resultado de cada cenário | [`docs/execucao-testes.md`](docs/execucao-testes.md) |
| Testes exploratórios manuais | Roteiro em [`docs/testes-exploratorios.md`](docs/testes-exploratorios.md). Planilha de resultados e prints em [`docs/testes-exploratorios/`](docs/testes-exploratorios/) |
| Report de bugs | [`docs/bugs.md`](docs/bugs.md) |
| Evidências da execução | [`docs/evidencias.md`](docs/evidencias.md) e prints em [`docs/evidencias/`](docs/evidencias/) |
| Automação com Playwright | [`src/`](src/) e [`playwright.config.ts`](playwright.config.ts) |
| Ambiguidades e interpretação adotada | [`docs/ambiguidades.md`](docs/ambiguidades.md) |

## Como rodar

Requisitos: Node.js 20 ou mais novo.

```bash
npm install
npx playwright install chromium
npm test
```

| Comando | O que faz |
|---|---|
| `npm test` | Roda tudo: API e interface |
| `npm run test:api` | Só os cenários de API (não abre navegador) |
| `npm run test:ui` | Só os cenários de interface |
| `npm run test:headed` | Interface com o navegador visível, um teste por vez |
| `npm run test:regressao` | Tudo, menos os cenários marcados com `@bug` |
| `npm run test:bugs` | Só os cenários marcados com `@bug` |
| `npm run report` | Abre o relatório HTML da última execução |

Para rodar um cenário ou uma regra específica, use a tag ou o código do cenário:

```bash
npx bddgen && npx playwright test --grep @CA06
npx bddgen && npx playwright test --grep "CT-UI-12"
```

Para apontar para outro endereço da loja, defina `BASE_URL` antes do comando.

## Relatórios e evidências

Cada execução gera:

- `playwright-report/`: relatório do Playwright, com print de todo teste de interface e, para os que falharam, trace e vídeo da execução.
- `cucumber-report/index.html`: relatório no formato Cucumber, com os passos em Gherkin.

Esses relatórios não ficam no repositório por causa do tamanho. O resultado da execução de 06/10/2026, com os prints, está em [`docs/evidencias.md`](docs/evidencias.md).

## Estrutura

```
features/
  ui/                        cenários executados no navegador
    cupom.feature              CA01 a CA05
    frete.feature              CA06 a CA09 e CA11
    limite-quantidade.feature  CA10
    checkout.feature           dados do cliente e confirmação do pedido
  api/                       cenários executados direto na API
    carrinho-calculo.feature   POST /api/carrinho/calcular
    pedidos.feature            POST /api/pedidos
    contrato-erros.feature     produtos e tabela de códigos de erro
src/
  steps/                     implementação dos passos (Dado, Quando, Então)
  pages/                     page objects: vitrine, carrinho e finalização
  support/catalogo.ts        massa de dados da documentação
docs/
  execucao-testes.md         resultado de cada cenário e testes exploratórios
  testes-exploratorios.md    roteiro dos testes exploratórios manuais
  testes-exploratorios/      planilha com o resultado de cada cenário exploratório e pasta prints/
  bugs.md                    report dos bugs encontrados
  evidencias.md              resultado da execução automatizada, com os prints
  evidencias/                um print por teste de interface
  ambiguidades.md            pontos ambíguos e a interpretação adotada
```

São 59 cenários, que viram 143 testes por causa dos exemplos dos esquemas: 54 de interface e 89 de API.

## Testes exploratórios manuais

Além da automação, 25 cenários foram executados à mão em 06 e 07/10/2026, no navegador e, para a API, no Postman. Eles procuram o que a documentação não previu: sequências de ações, recarregar a página, uso só pelo teclado, tela estreita e requisições que a interface nunca enviaria.

- **Roteiro**, com passos e resultado esperado: [`docs/testes-exploratorios.md`](docs/testes-exploratorios.md)
- **Resultados**, na planilha [`testes-exploratorios.xlsx`](docs/testes-exploratorios/testes-exploratorios.xlsx), e **prints** de cada cenário em [`docs/testes-exploratorios/prints/`](docs/testes-exploratorios/prints/)

| Sessão | Cenários | O que explora | Passou | Falhou | Observação |
|---|---|---|---|---|---|
| Cupom no carrinho | TE-01 a TE-04 | Tecla Enter, corrigir depois de um erro, cupom após remover o último item, recarregar a página | 3 | 0 | 1 |
| Frete e valores | TE-05 a TE-07 | Cruzar os R$ 200,00 com cupom, limite exato, carrinho no máximo | 2 | 1 | 0 |
| Quantidade | TE-08 e TE-09 | Limite de 5 unidades ao recarregar e trocar de página, contador do carrinho | 2 | 0 | 0 |
| Finalização da compra | TE-10 a TE-16 | Nome com acentos, duplo clique, botão voltar, formatos de CEP | 6 | 0 | 1 |
| Navegação e ambiente | TE-17 a TE-20 | Endereço inexistente, outra aba, tela estreita, uso só pelo teclado | 4 | 0 | 0 |
| API chamada direto | TE-21 a TE-25 | Campos a mais na requisição, quantidade acima do limite, métodos não aceitos | 3 | 1 | 1 |
| **Total** | **25** | | **20** | **2** | **3** |

**Observação** é o resultado usado quando a documentação não cobre o caso e o teste registra o que a loja faz.

Os dois cenários que falharam reproduzem à mão bugs já reportados em [`docs/bugs.md`](docs/bugs.md):

- **TE-06**: subtotal de exatamente R$ 200,00 com frete de R$ 19,90 cobrado (BUG-01).
- **TE-23**: pedido confirmado pela API com 6 unidades do mesmo produto (BUG-02).

As três observações ficam como perguntas para o time:

- **TE-03**: o cupom continua aplicado depois de remover o último item pelo botão "Remover" e adicionar outro produto.
- **TE-11**: os dados digitados na finalização somem ao voltar ao carrinho e retornar.
- **TE-25**: a API aceita um nome de cliente só com números (`12 34`).

## Convenções dos cenários

- **Código**: `CT-UI-xx` para interface e `CT-API-xx` para API.
- **Tags de regra**: `@CA01` a `@CA11` ligam o cenário ao critério de aceite.
- **`@bug` e `@BUG-xx`**: o cenário descreve o comportamento esperado pela documentação e falha por causa de um bug conhecido.
- **`@ambiguidade`**: a documentação não cobre o caso. O cenário registra a interpretação descrita em `docs/ambiguidades.md`.
- **Itens do carrinho**: `"2x Mochila Urbana 20L, 1x Boné Aba Curva"` na interface e `"2x P005, 1x P004"` na API.
- **`[espaço]`**: representa um espaço em branco digitado no cupom. O Gherkin descarta espaços nas pontas das células de exemplos.

## Cenários que falham hoje

Os cenários `@bug` falham de propósito: eles conferem o que a documentação pede, e a loja não cumpre. São 14 testes. O detalhe de cada bug está em [`docs/bugs.md`](docs/bugs.md).

| Bug | Resumo | Critério | Cenários |
|---|---|---|---|
| BUG-01 | Com subtotal de exatamente R$ 200,00 a loja cobra R$ 19,90 de frete e exibe "Faltam R$ 0,00 para o frete grátis." | CA06 | CT-UI-11, CT-UI-13, CT-API-01, CT-API-02, CT-API-22 |
| BUG-02 | A API aceita mais de 5 unidades do mesmo produto, no cálculo (200) e no pedido (201). | CA10 | CT-API-06, CT-API-28 |
| BUG-03 | Item sem `produtoId` devolve `PRODUTO_NAO_ENCONTRADO` com a mensagem "Produto undefined não encontrado." no lugar de `ITEM_INVALIDO`. | Códigos de erro | CT-API-48 |

## Decisões de automação

- **Interface como o cliente usa**: o carrinho é montado clicando em "Adicionar ao carrinho" na vitrine, sem gravar dados direto no navegador.
- **API testada à parte**: os cálculos são feitos pela API, então limites e arredondamento são conferidos nela, com mais combinações e sem depender da tela.
- **Tela comparada com a API**: o cenário CT-UI-16 confere que a tela exibe os mesmos valores que a API calculou.
- **Localizadores**: papéis e rótulos acessíveis (botão, campo, título) sempre que existem, os atributos `data-valor` do resumo e, onde não há alternativa, classes CSS.
- **Ambiente compartilhado**: a execução usa 4 workers e não faz teste de carga, como pede o enunciado.
