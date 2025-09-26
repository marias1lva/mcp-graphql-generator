# MCP GraphQL Query Generator 🚀

## Overview
The **MCP GraphQL Query Generator** is a smart and generic tool that **automatically discovers and generates GraphQL queries** for any API. Using **introspection**, it detects all available types (users, products, orders, etc.) and generates table-formatted queries with pagination, filters, and sorting.

> **MCP (Model Context Protocol)** integration allows seamless use with VS Code and GitHub Copilot!

## ✨ Key Features

### 🔍 **Automatic Discovery**
- **Automatic GraphQL API introspection**
- Discovers all available `list*` types (listUsers, listProducts, listOrders, etc.)
- No manual field configuration needed

### 📋 **Smart Query Generation**
- Generates **table-formatted** queries with complete pagination
- Support for **filters**, **sorting**, and **pagination**
- **Depth control** for nested fields
- **Custom queries** with specific fields

### 🛠️ **Multiple Interfaces**
- **Interactive CLI** for terminal use
- **REST API** for integration with other tools
- **HTTP Server** with automatic documentation
- **VS Code integration** via MCP

### 🔒 **Security & Flexibility**
- Multiple authentication types support (Bearer Token, API Key, Keycloak)
- Secure credential management via environment variables
- TypeScript for type safety

## 🏗️ Arquitetura

```
mcp-graphql-query-generator/
├── src/
│   ├── app.ts                          # Ponto de entrada do servidor
│   ├── cli.ts                          # Interface de linha de comando
│   ├── config/
│   │   └── credentials.ts              # Gerenciamento de credenciais
│   ├── services/
│   │   └── graphqlIntrospection.ts     # Serviço de introspection GraphQL
│   ├── generators/
│   │   └── genericQueryGenerator.ts    # Gerador genérico de queries
│   └── mcp/
│       └── server.ts                   # Servidor MCP com API REST
├── .env.example                        # Template de variáveis de ambiente
├── package.json                        # Configurações npm
└── README.md                          # Esta documentação
```

## 🚀 Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/yourusername/mcp-graphql-query-generator.git
   cd mcp-graphql-query-generator
   ```

2. **Instale as dependências:**
   ```bash
   # Com Bun (recomendado - mais rápido)
   bun install
   
   # Ou com npm
   npm install
   ```

3. **Configure a API (opcional):**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com a URL da sua API
   ```

   Exemplo de configuração no `.env`:
   ```env
   # URL da API GraphQL (obrigatório)
   GRAPHQL_API_URL=https://your-api.example.com/graphql
   
   # Autenticação (opcional - muitas APIs funcionam sem)
   # API_TOKEN=seu_token_bearer_aqui
   # API_KEY=sua_api_key_aqui
   
   # Porta do servidor (opcional)
   PORT=3000
   ```

   **💡 Nota:** Muitas APIs GraphQL funcionam sem autenticação para introspection. Teste primeiro sem credenciais!

## 🎯 Como Usar

### 📱 CLI (Interface de Linha de Comando)

#### 1. **Descobrir queries disponíveis:**
```bash
# Com npm
npm run cli list
# ou
npx ts-node src/cli.ts list

# Com Bun (recomendado - mais rápido)
bun src/cli.ts list
```
**Saída esperada:**
```
🔍 Descobrindo queries disponíveis...

✅ Queries disponíveis:

  1. listInvoices
  2. listOrganizationContacts  
  3. listFixedAssets
  4. listCostCenters
  5. listProducts
  ...
  
📊 Total: 98 queries encontradas
```

#### 2. **Analisar tipos de campos de uma query:**
```bash
# Análise completa com hierarquia
bun src/cli.ts analyze listInvoices

# Apenas campos escalares (String, Int, Boolean, etc.)
bun src/cli.ts analyze listInvoices --scalars-only

# Formato JSON para automação
bun src/cli.ts analyze listInvoices --format json

# Formato CSV para planilhas
bun src/cli.ts analyze listInvoices --format csv

# Controlar profundidade
bun src/cli.ts analyze listInvoices --depth 2
```
**Saída esperada:**
```
🔍 Analisando tipos de campos para: listInvoices

📋 Tipos de campos identificados:

accessKey: String
accountableOrganizationContact: OrganizationContact
  ├─ subcampos (28):
  ├─ accounts: [Account]
  ├─ addresses: [Address]
  ├─ name: String
  └─ ...
audited: Boolean
issueDate: Date
number: String

📊 Resumo:
   • Total de campos: 31
   • Campos escalares: 8
   • Objetos complexos: 23
```

#### 3. **Gerar query de tabela completa:**
```bash
# Com Bun (recomendado)
bun src/cli.ts generate listInvoices

# Com npm
npm run cli generate listInvoices
```

#### 4. **Query customizada com campos específicos:**
```bash
bun src/cli.ts generate listInvoices --fields "id,status,number,issueDate"
```

#### 5. **Query simples (sem paginação):**
```bash
bun src/cli.ts generate listInvoices --simple
```

#### 6. **Controlar profundidade de campos aninhados:**
```bash
# Apenas 1 nível (sem subcampos)
bun src/cli.ts generate listInvoices --depth 1

# Até 3 níveis de profundidade
bun src/cli.ts generate listInvoices --depth 3
```

#### 7. **Testar conexão:**
```bash
bun src/cli.ts test
```

#### 8. **Ver exemplos interativos:**
```bash
bun src/cli.ts help-examples
```
**Saída:** Mostra todos os exemplos de uso disponíveis com explicações detalhadas.
**Resultado:**
```graphql
query table_listInvoices(
  $page: Int! = 1
  $pageSize: Int! = 10
  $filters: [FlopFilters]!
  $orderBy: [String]!
  $orderDirections: [String]!
) {
  table: listInvoices(
    params: {
      page: $page
      pageSize: $pageSize
      filters: $filters
      orderBy: $orderBy
      orderDirections: $orderDirections
    }
  ) {
    data {
      id
      status
      number
      issueDate
      series
      costCenter {
        id
        name
      }
      itemsAmount
      amount
      taxAdditionAmount
      observation
    }
    totalCount
    totalPages
    currentPage
    pageSize
  }
}
```



### 🌐 API REST

#### 1. **Iniciar o servidor:**
```bash
npm start
# Servidor roda em http://localhost:3000
```

#### 2. **Endpoints disponíveis:**

**📋 Gerar query de tabela:**
```bash
POST /generate-table-query
Content-Type: application/json

{
  "queryName": "listInvoices",
  "options": {
    "includePagination": true,
    "includeFilters": true,
    "includeOrdering": true,
    "maxDepth": 2
  }
}
```

**🔍 Listar queries disponíveis:**
```bash
GET /available-queries
```

**🎯 Query customizada:**
```bash
POST /generate-custom-query
Content-Type: application/json

{
  "queryName": "listInvoices",
  "selectedFields": ["id", "status", "number", "issueDate"],
  "options": {
    "maxDepth": 1
  }
}
```

**📖 Documentação completa:**
```bash
GET /help
```

## 🎪 Exemplos Práticos

### Exemplo 1: Descobrir e Analisar API
```bash
# 1. Primeiro, descubra quais queries estão disponíveis
bun src/cli.ts list

# 2. Analise os campos de uma query específica
bun src/cli.ts analyze listInvoices

# 3. Veja apenas os campos escalares (mais simples)
bun src/cli.ts analyze listInvoices --scalars-only
```

### Exemplo 2: Gerar Query Completa para Faturas
```bash
# Query completa com paginação, filtros e ordenação
bun src/cli.ts generate listInvoices

# Query simples sem paginação
bun src/cli.ts generate listInvoices --simple
```

### Exemplo 3: Query Customizada para Contatos
```bash
# Primeiro analise os campos disponíveis
bun src/cli.ts analyze listOrganizationContacts --scalars-only

# Depois gere uma query com campos específicos
bun src/cli.ts generate listOrganizationContacts --fields "id,name,email,phone"
```

### Exemplo 4: Controle de Profundidade
```bash
# Campos simples (sem objetos aninhados)
bun src/cli.ts generate listFixedAssets --depth 1

# Com subcampos (até 2 níveis)
bun src/cli.ts generate listFixedAssets --depth 2
```

## ⚙️ Configuração Avançada

### Autenticação
O sistema suporta múltiplos tipos de autenticação:

**Bearer Token:**
```env
GRAPHQL_API_URL=https://api.example.com/graphql
API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**API Key:**
```env
GRAPHQL_API_URL=https://api.example.com/graphql
API_KEY=your-api-key-here
API_SECRET=your-secret-here
```

### Controle de Profundidade
Use `--depth` para controlar quantos níveis de campos aninhados incluir:
```bash
# Apenas campos diretos
bun src/cli.ts generate listInvoices --depth 1

# Até 3 níveis de profundidade  
bun src/cli.ts generate listInvoices --depth 3
```

### Análise de Tipos
Use o comando `analyze` para entender a estrutura antes de gerar queries:
```bash
# Ver todos os tipos
bun src/cli.ts analyze listInvoices

# Apenas campos escalares (String, Int, Boolean, etc.)
bun src/cli.ts analyze listInvoices --scalars-only

# Exportar para CSV
bun src/cli.ts analyze listInvoices --format csv

# Formato JSON para automação
bun src/cli.ts analyze listInvoices --format json
```

## 🐛 Solução de Problemas

### Erro de Conexão
```bash
❌ Falha na conexão: Failed to connect to GraphQL API
```
**Solução:**
1. Verifique se `GRAPHQL_API_URL` está correto no `.env`
2. Confirme se a API está online
3. Teste as credenciais manualmente

### Query Não Encontrada
```bash
❌ Erro: Query 'listSomething' not found in GraphQL schema
```
**Solução:**
1. Execute `npm run cli list` para ver queries disponíveis
2. Verifique se o nome está correto (case-sensitive)

### Campos Vazios
Se a query gerada não tem campos, pode ser:
1. API não suporta introspection
2. Tipo de retorno não segue padrão esperado
3. Permissões insuficientes

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`) 
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🚀 **Comandos Essenciais (Resumo)**

```bash
# Listar queries disponíveis
bun src/cli.ts list

# Analisar tipos de campos
bun src/cli.ts analyze listInvoices

# Gerar query completa
bun src/cli.ts generate listInvoices

# Testar conexão
bun src/cli.ts test

# Ver exemplos de uso
bun src/cli.ts help-examples
```

**Feito com ❤️ para simplificar a geração de queries GraphQL**