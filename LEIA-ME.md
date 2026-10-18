# Nexo Store — publicação na sua Cloudflare

Este pacote contém a loja, o código-fonte editável, a interface já compilada e a configuração do banco informado em 18/10/2026.

## 1. Extrair e abrir

Extraia o ZIP. No VS Code, abra a pasta `nexo-cloudflare` que contém `package.json` e `wrangler.jsonc`. Abra Terminal > Novo Terminal. Todos os comandos abaixo devem ser executados nessa pasta, um de cada vez.

Pré-requisitos já realizados: Node.js LTS, npm e login com `npx.cmd wrangler login` na sua conta Cloudflare. Se o login expirar, execute-o novamente. Não copie o arquivo de credenciais do Wrangler para este projeto.

## 2. Instalar as ferramentas

```powershell
npm.cmd install
```

## 3. Criar as tabelas no banco que você já criou

```powershell
npm.cmd run db:migrate
```

Confirme com `y` se o Wrangler pedir autorização para aplicar as migrações remotas. O arquivo `wrangler.jsonc` já usa:

- nome: `nexo-store-db`
- binding: `nexo_store_db`
- ID: `3acdcce5-b80a-4f94-84a4-beabeb60a0b4`

O binding é o nome pelo qual o código encontra o banco: `env.nexo_store_db`. O ID não é senha. As credenciais de sua conta não estão neste pacote.

## 4. Inserir o catálogo

```powershell
npm.cmd run db:seed
```

Confirme com `y` se solicitado. `seed.sql` contém o catálogo público capturado da loja existente em 18/10/2026. Usa `INSERT OR IGNORE`: reaplicá-lo não sobrescreve os produtos já cadastrados. Os pedidos simulados da hospedagem anterior não são transferidos. Carrinhos do navegador também não passam automaticamente para outro domínio.

## 5. Publicar

```powershell
npm.cmd run deploy
```

O comando compila a interface e publica o Worker na sua conta. Se precisar ativar ou escolher seu subdomínio `workers.dev`, siga o fluxo indicado pela Cloudflare. Ao final aparecerá a URL real, com formato `https://nexo-store.SEUSUBDOMINIO.workers.dev`.

O Worker se chama `nexo-store`; se você já tiver outro Worker com esse nome, altere `name` no `wrangler.jsonc` antes de publicar. Esta instalação não altera o site anterior.

Nesse momento o catálogo e o checkout já estão públicos. O painel permanece bloqueado até a próxima etapa.

## 6. Configurar a senha do lojista

```powershell
npm.cmd run setup:admin
```

O script cria uma senha aleatória de 32 caracteres, grava-a como secret `ADMIN_PASSWORD` na sua Cloudflare e a mostra **somente no seu terminal**. Guarde-a em seu gerenciador de senhas. Não me envie essa senha.

No rodapé da loja, clique em **Acesso do lojista** e informe a senha. Após entrar, aparecerá **Painel do lojista**. Há também **Sair do painel** no rodapé.

A senha não fica nos arquivos nem no código da interface. O cookie de sessão é assinado e usa HttpOnly, Secure e SameSite=Strict, com duração de 8 horas. São permitidas até 5 tentativas de login por IP por janela de 15 minutos. Sem senha configurada, ou com um secret com menos de 24 caracteres, o painel fica bloqueado no servidor. Senhas geradas pelo script atendem a esse requisito.

Para trocar uma senha perdida ou comprometida, execute novamente `npm.cmd run setup:admin`. As sessões assinadas com a senha anterior deixam de ser válidas. Não há recuperação por e-mail neste projeto.

## 7. Conferir e atualizar o portfólio

- Abra a URL em uma janela anônima: o catálogo deve aparecer, e o botão de gestão não deve aparecer.
- Faça uma compra simulada. Não informe dados bancários: o checkout não pede cartão e não faz cobrança.
- Entre como lojista e confira o pedido e a redução de estoque.
- Teste uma recusa: o pedido não é criado e o carrinho permanece.
- Envie apenas a URL pública resultante para atualizar o botão da loja no portfólio. Este pacote não muda automaticamente o link do portfólio nem migra sua hospedagem.

## Como editar depois

- `src/Store.tsx`: textos, componentes React e interações da loja.
- `src/styles.css`: cores, tamanhos, layout e comportamento em telas pequenas.
- `worker/store.ts`: catálogo, validações, cálculo de valores, estoque e pedidos.
- `worker/auth.ts`: login, sessão e autorização do lojista.
- `worker/index.ts`: encaminhamento das rotas e entrega dos arquivos da interface.
- `wrangler.jsonc`: nome da aplicação, banco e diretório da interface compilada.
- `migrations/`: estrutura SQL. Para mudar tabelas, adicione uma nova migração, sem alterar as já aplicadas.
- `seed.sql`: catálogo inicial. Para modificar produtos em uso, utilize o painel.

Depois de editar, execute:

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run deploy
```

O login usado na hospedagem anterior dependia do ChatGPT e foi substituído por autenticação própria com senha. O projeto exportado usa React + Vite para a interface e um Cloudflare Worker para o servidor. A API permanece em `/api/store`, no mesmo domínio da loja.

## Linguagens e lógica, passo a passo

1. **HTML e JSX/TSX** estruturam a página: cabeçalho, produtos, carrinho, formulários e painel.
2. **CSS** define a aparência e adapta o layout para celular e computador.
3. **TypeScript e React** controlam a interface. Os estados guardam busca, categoria, carrinho e telas abertas. `useEffect` carrega os produtos e recupera o carrinho do `localStorage`.
4. **HTTP e JSON** conectam navegador e servidor. GET busca o catálogo. POST solicita compras ou ações administrativas.
5. **SQL e D1** mantêm produtos e pedidos no servidor. Valores monetários são inteiros em centavos para evitar imprecisões de ponto flutuante.
6. Ao comprar, o servidor consulta preços e quantidades atuais, calcula `preço × quantidade`, soma o frete e verifica o estoque. Valores enviados pelo navegador não definem o preço final.
7. O pagamento possui dois resultados fictícios. Uma recusa não cria pedido. Na aprovação, a inserção do pedido e a baixa de estoque acontecem em um lote transacional. Se o estoque se esgotar entre a consulta e a gravação, a condição SQL bloqueia a compra.
8. O servidor verifica a sessão do lojista antes de cadastrar ou alterar produtos, atualizar status ou listar pedidos. Ocultar os botões é apenas uma parte visual dessa proteção.
9. **Vite** compila os arquivos React em HTML, CSS e JavaScript. **Wrangler** publica o Worker e a interface na sua conta.

## Limites e observações

Este é um projeto de portfólio com catálogo de exemplo, entrega fictícia e pagamento simulado. Não se conecta à API Stripe. Não oferece faturamento, cálculo real de frete, cobrança de cartão ou gestão de clientes reais. Compras de demonstração reduzem o estoque; o proprietário pode repor as quantidades no painel.

A hospedagem e o D1 dependem dos limites e condições do plano gratuito da sua conta. O pacote foi validado com compilação, checagem TypeScript, testes de API/autenticação e empacotamento Wrangler em modo dry-run. Não foi publicado nesta conta, pois o login está no computador do proprietário. A interface não foi testada em navegador neste ambiente.
