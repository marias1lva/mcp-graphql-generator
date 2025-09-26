# CONFIGURAÇÃO VS CODE - MCP GraphQL Query Generator

## 🎯 Instruções de Instalação

### Passo 1: Configurações Globais do VS Code

Adicione as seguintes configurações ao seu **settings.json** global do VS Code:
- Abra VS Code
- Pressione `Ctrl+Shift+P`
- Digite "Preferences: Open Settings (JSON)"
- Adicione as configurações abaixo:

```json
{
  "mcp.servers": {
    "graphql-query-generator": {
      "name": "GraphQL Query Generator",
      "url": "http://localhost:3001",
      "description": "Gerador automático de queries GraphQL usando introspection",
      "enabled": true,
      "autoStart": true,
      "timeout": 30000
    }
  },
  
  "github.copilot.chat.experimental.codeActions": true,
  "github.copilot.chat.experimental.contextualActions": true,
  
  "graphql.useLanguageServer": true,
  "rest-client.enableTelemetry": false
}
```

### Passo 2: Atalhos de Teclado (Opcional)

Adicione ao seu **keybindings.json**:
- Pressione `Ctrl+Shift+P`
- Digite "Preferences: Open Keyboard Shortcuts (JSON)"
- Adicione:

```json
[
  {
    "key": "ctrl+shift+g q",
    "command": "mcpGraphQL.generateQuery",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+shift+g l", 
    "command": "mcpGraphQL.listQueries",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+shift+g a",
    "command": "mcpGraphQL.analyzeAPI", 
    "when": "editorTextFocus"
  }
]
```

## 🔧 Configurações Avançadas

### Para Projetos Específicos

Crie um `.vscode/settings.json` em projetos específicos:

```json
{
  "mcpGraphQL.projectSettings": {
    "apiUrl": "https://sua-api-especifica.com/graphql",
    "authToken": "${env:PROJECT_API_TOKEN}",
    "defaultDepth": 2,
    "enablePagination": true
  }
}
```

### Variáveis de Ambiente por Projeto

Crie um `.env` na raiz do projeto:

```env
# Configurações específicas do projeto
GRAPHQL_API_URL=https://sua-api.com/graphql
API_TOKEN=seu_token_aqui
PROJECT_NAME=MeuProjeto
```

## 📋 Extensões Recomendadas

Instale estas extensões para melhor integração:

1. **GraphQL: Language Feature Support** (`GraphQL.vscode-graphql`)
2. **REST Client** (`humao.rest-client`) 
3. **GitHub Copilot** (`GitHub.copilot`)
4. **Thunder Client** (`rangav.vscode-thunder-client`)

## 🚀 Como Usar

### No Copilot Chat:
- "Liste as queries GraphQL disponíveis"
- "Gere uma query para listar faturas"
- "Quais campos estão disponíveis na entidade Usuario?"
- "Crie uma query com paginação para produtos"

### Via Command Palette:
- `Ctrl+Shift+P` → "MCP: Generate GraphQL Query"
- `Ctrl+Shift+P` → "MCP: List Available Queries"
- `Ctrl+Shift+P` → "MCP: Analyze API Schema"

### Via REST Client:
```http
### Listar queries disponíveis
GET http://localhost:3001/mcp/queries

### Gerar query específica
POST http://localhost:3001/mcp/generate-query
Content-Type: application/json

{
  "queryName": "listInvoices",
  "options": {
    "includePagination": true,
    "maxDepth": 2
  }
}
```