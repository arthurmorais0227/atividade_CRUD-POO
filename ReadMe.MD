# 1. Criar projeto
- npm init -y

# 2. Ajustar package.json
- Adicionar: "type": "module"
- Adicionar: "main": "server.js"
- Adicionar dentro do script: "dev": "nodemon server.js"

# 3. Instalar dependência
- npm i express dotenv pg @prisma/client @prisma/adapter-pg
- npm i -D nodemon prisma

# 4. Inicializar Prisma
- npx prisma init --datasource-provider postgresql

# 5. Configurar `.env`
- DATABASE_URL="postgresql://usuario:senha@localhost:porta/nome_do_banco_db"

# 6. Configurar schema.prisma
- crie suas tabelas

# 7. Gerar SQL
- npx prisma migrate dev --name init
- npx prisma generate

# 8. Semear dados no banco
- npx prisma db seed

# 9. Abrir Prisma Studio
- npx prisma studio

## Casos de erros

### Após alterar schema.prisma
- npx prisma migrate dev --name nome_da_alteracao (exemplo: adicionar_tabela_users)

### Banco inconsistente (⚠️ APAGA TUDO)
- npx prisma migrate reset

### Apenas popular dados
- npx prisma db seed

### Dicas
|   Comando       | Apaga dados?    | Cria migrations? | Uso            |
| --------------- | ------------    | ---------------- | -------------- |
| `migrate dev`   | ❌ Não          | ✅ Sim          | Alterar schema |
| `db seed`       | ❌ Não          | ❌ Não          | Popular dados  |
| `migrate reset` | ✅ SIM          | ❌ Não          | DEV only       |


# Atividade CRUD - POO

Uma API RESTful para gerenciamento de pedidos, clientes, produtos e itens de pedido, desenvolvida utilizando Programação Orientada a Objetos (POO) com Node.js, Express e Prisma ORM.

## Descrição

Este projeto implementa um sistema de CRUD completo para uma aplicação de pedidos, incluindo validações de negócio como impedir a adição de produtos indisponíveis aos pedidos. Utiliza PostgreSQL como banco de dados e Prisma para mapeamento objeto-relacional.

## Funcionalidades

- **Clientes**: Cadastro, listagem, atualização e exclusão de clientes com validações de CPF, email e telefone únicos.
- **Produtos**: Gerenciamento de produtos com categorias (Lanche, Bebida, Sobremesa, Combo), controle de disponibilidade e validações de preço.
- **Pedidos**: Criação e gerenciamento de pedidos com status (Aberto, Pago, Cancelado), cálculo automático de total e adição/remoção de itens.
- **Itens de Pedido**: Controle detalhado dos itens em cada pedido, com validações de quantidade e disponibilidade de produtos.
- **Regras de Negócio**:
  - Não é possível adicionar produtos indisponíveis a pedidos.
  - Pedidos só podem ser alterados se estiverem em status "Aberto".
  - Produtos não podem ser deletados se estiverem vinculados a pedidos em aberto.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express.js**: Framework web para Node.js.
- **Prisma**: ORM para interação com o banco de dados.
- **PostgreSQL**: Banco de dados relacional.
- **Nodemon**: Ferramenta para reinicialização automática do servidor durante desenvolvimento.

## Pré-requisitos

- Node.js (versão 16 ou superior)
- PostgreSQL instalado e rodando
- npm ou yarn

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/arthurmorais0227/atividade_CRUD-POO.git
   cd atividade_CRUD-POO
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env` com a URL do banco de dados:
   ```
   DATABASE_URL="postgresql://usuario:senha@localhost:porta/nome_do_banco_db"
   ```

4. Execute as migrações do Prisma:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. (Opcional) Popule o banco com dados de exemplo:
   ```bash
   npx prisma db seed
   ```

## Uso

Para iniciar o servidor em modo de desenvolvimento:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`.

### Endpoints da API

#### Clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes` - Listar todos os clientes
- `GET /api/clientes/:id` - Buscar cliente por ID
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

#### Produtos
- `POST /api/produtos` - Criar produto
- `GET /api/produtos` - Listar todos os produtos (com filtros opcionais: nome, categoria, precoMin, precoMax)
- `GET /api/produtos/:id` - Buscar produto por ID
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto

#### Pedidos
- `POST /api/pedidos` - Criar pedido
- `GET /api/pedidos` - Listar todos os pedidos
- `GET /api/pedidos/:id` - Buscar pedido por ID
- `PUT /api/pedidos/:id` - Atualizar pedido
- `PUT /api/pedidos/:id/cancelar` - Cancelar pedido
- `POST /api/pedidos/:id/itens` - Adicionar item ao pedido
- `DELETE /api/pedidos/:id/itens/:itemId` - Remover item do pedido
- `DELETE /api/pedidos/:id` - Deletar pedido

#### Itens de Pedido
- `GET /api/itens-pedido` - Listar todos os itens (com filtros opcionais: pedidoId, produtoId)
- `GET /api/itens-pedido/:id` - Buscar item por ID
- `PUT /api/itens-pedido/:id` - Atualizar item
- `DELETE /api/itens-pedido/:id` - Deletar item

### Exemplos de Uso

#### Criar um Produto
```bash
curl -X POST http://localhost:3000/api/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Hambúrguer",
    "descricao": "Delicioso hambúrguer artesanal",
    "categoria": "LANCHE",
    "preco": 15.99,
    "disponivel": true
  }'
```

#### Criar um Pedido
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": 1,
    "total": 0,
    "status": "ABERTO",
    "itens": [
      {
        "produtoId": 1,
        "quantidade": 2
      }
    ]
  }'
```

## Estrutura do Banco de Dados

O projeto utiliza as seguintes tabelas:

- **clientes**: Informações dos clientes (nome, telefone, email, CPF, endereço)
- **produtos**: Catálogo de produtos (nome, descrição, categoria, preço, disponibilidade)
- **pedidos**: Cabeçalho dos pedidos (cliente, total, status, data de criação)
- **itens_pedido**: Itens de cada pedido (produto, quantidade, preço unitário)

Enums:
- **Categoria**: LANCHE, BEBIDA, SOBREMESA, COMBO
- **StatusPedido**: ABERTO, PAGO, CANCELADO

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento com Nodemon

## Desenvolvimento

Para visualizar e editar o banco de dados:
```bash
npx prisma studio
```

Para resetar o banco (apaga todos os dados):
```bash
npx prisma migrate reset
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Autores

Arthur Morais, Daniel Casalli, Fernando Santos, Gustavo Victor, Manuela Maestro e Maria Eduarda Andrade
