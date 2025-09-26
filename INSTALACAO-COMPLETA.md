# 🚀 MCP GraphQL Query Generator - Instalação Global para VS Code

## 📋 Sobre o Projeto

Este é um **servidor MCP (Model Context Protocol)** que:

- 🔍 **Descobre automaticamente** APIs GraphQL usando introspection
- 📋 **Gera queries inteligentes** com paginação, filtros e ordenação
- 🛠️ **Integra perfeitamente** com VS Code e GitHub Copilot
- 🌐 **Funciona globalmente** em qualquer projeto VS Code
- 🔒 **Suporta autenticação** (Bearer Token, API Key)

## 🎯 Instalação Completa - Passo a Passo

### ✅ Pré-requisitos

1. **Bun Runtime** (recomendado) ou Node.js
   ```powershell
   # Instalar Bun (recomendado - mais rápido)
   powershell -c "irm bun.sh/install.ps1 | iex"
   
   # OU Node.js (alternativa)
   # Download: https://nodejs.org/
   ```

2. **VS Code** com **GitHub Copilot**
   ```
   Extensões necessárias:
   - GitHub Copilot
   - GraphQL: Language Feature Support (opcional)
   - REST Client (opcional)
   ```

### 🚀 Passo 1: Instalação Global

**Execute como Administrador** no PowerShell:

```powershell
# Navegar para a pasta do projeto
cd "caminho/para/mcp-graphql-query-generator"

# Executar instalação global
.\install-global.ps1

# OU com parâmetros personalizados
.\install-global.ps1 -InstallPath "C:\MCP\GraphQLServer" -Port 3001 -AutoStart
```

**O que este comando faz:**
- ✅ Copia servidor para `%APPDATA%\MCPGraphQLServer`
- ✅ Instala dependências automaticamente
- ✅ Cria configuração global (`.env`)
- ✅ Configura inicialização automática
- ✅ Cria atalho na área de trabalho

### 🔧 Passo 2: Configurar VS Code

#### 2.1 Settings Globais

Abra **Settings (JSON)** no VS Code:
- `Ctrl+Shift+P` → "Preferences: Open Settings (JSON)"
- Adicione estas configurações:

```json
{
  "mcp.servers": {
    "graphql-query-generator": {
      "name": "GraphQL Query Generator", 
      "url": "http://localhost:3001",
      "description": "Gerador automático de queries GraphQL",
      "enabled": true,
      "autoStart": true,
      "timeout": 30000
    }
  },
  
  "github.copilot.chat.experimental.codeActions": true,
  "github.copilot.chat.experimental.contextualActions": true,
  "graphql.useLanguageServer": true
}
```

#### 2.2 Atalhos de Teclado (Opcional)

Abra **Keybindings (JSON)**:
- `Ctrl+Shift+P` → "Preferences: Open Keyboard Shortcuts (JSON)"

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
  }
]
```

### ⚡ Passo 3: Configurar Auto-Inicialização

```powershell
# Configurar inicialização automática
.\configure-autostart.ps1 -Action install

# Verificar status
.\configure-autostart.ps1 -Action status

# Desinstalar (se necessário)
.\configure-autostart.ps1 -Action uninstall
```

### 🔧 Passo 4: Configurar sua API (Se necessário)

Edite o arquivo de configuração:
```powershell
notepad "%APPDATA%\MCPGraphQLServer\.env"
```

```env
# URL da sua API GraphQL
   GRAPHQL_API_URL=https://your-api.example.com/graphql# Autenticação (opcional)
API_TOKEN=seu_bearer_token_aqui
# OU
API_KEY=sua_api_key_aqui

# Configurações do servidor
MCP_PORT=3001
MAX_DEPTH=3
ENABLE_CORS=true
```

## 🎉 Como Usar no VS Code

### 💬 Com GitHub Copilot Chat

Agora você pode usar o Copilot em **qualquer projeto** VS Code:

```
👤 "Liste as queries GraphQL disponíveis"
🤖 Analisando API... Encontrei estas queries:
   - listInvoices: Lista todas as faturas
   - listUsers: Lista usuários do sistema
   - listProducts: Lista produtos disponíveis

👤 "Gere uma query para listar faturas com paginação"
🤖 query ListInvoices($first: Int, $after: String) {
     listInvoices(first: $first, after: $after) {
       edges { node { id, number, date, total } }
       pageInfo { hasNextPage, endCursor }
     }
   }

👤 "Quais campos tem na entidade User?"
🤖 A entidade User possui estes campos:
   - id (ID!): Identificador único
   - name (String): Nome completo
   - email (String): Email do usuário
   - createdAt (DateTime): Data de criação
```

### 🎯 Via Command Palette

- `Ctrl+Shift+P` → "MCP: Generate GraphQL Query"
- `Ctrl+Shift+P` → "MCP: List Available Queries"  
- `Ctrl+Shift+P` → "MCP: Analyze API Schema"

### 🌐 Via API REST

Use **REST Client** ou **Thunder Client**:

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
    "includeFilters": true,
    "maxDepth": 2
  }
}

### Analisar campos de uma entidade
GET http://localhost:3001/mcp/analyze/User
```

## 🔧 Gerenciamento do Servidor

### Comandos Úteis

```powershell
# Verificar status
.\configure-autostart.ps1 -Action status

# Iniciar manualmente
%APPDATA%\MCPGraphQLServer\start-global.bat

# Iniciar em background
%APPDATA%\MCPGraphQLServer\start-silent.ps1

# Verificar se está rodando
curl http://localhost:3001/mcp/health
```

### Logs e Troubleshooting

```powershell
# Ver logs do servidor
Get-Content "%APPDATA%\MCPGraphQLServer\logs\server.log" -Tail 50

# Verificar processos
Get-Process -Name "bun" | Where-Object { $_.CommandLine -like "*mcp-server*" }

# Testar conexão
Test-NetConnection -ComputerName localhost -Port 3001
```

## 🎯 Configurações por Projeto

Para APIs específicas, crie `.vscode/settings.json` no projeto:

```json
{
  "mcpGraphQL.projectSettings": {
    "apiUrl": "https://minha-api-especifica.com/graphql",
    "authToken": "${env:PROJECT_API_TOKEN}",
    "defaultDepth": 2,
    "enablePagination": true,
    "customHeaders": {
      "X-Custom-Header": "valor"
    }
  }
}
```

## 🚀 Funcionalidades Avançadas

### 🔍 Descoberta Automática
- Detecta todos os tipos `list*` disponíveis
- Analisa esquema GraphQL automaticamente  
- Sugere queries baseadas no contexto

### 📋 Geração Inteligente
- Queries formatadas para tabelas
- Paginação automática (Relay/offset)
- Filtros e ordenação
- Controle de profundidade

### 🔒 Segurança
- Suporte a múltiplos tipos de auth
- Variáveis de ambiente seguras
- CORS configurável
- Rate limiting

## 📞 Suporte

### Problemas Comuns

**❌ Servidor não inicia:**
```powershell
# Verificar se Bun está instalado
bun --version

# Reinstalar dependências
cd "%APPDATA%\MCPGraphQLServer"
bun install
```

**❌ VS Code não reconhece o MCP:**
- Verifique se GitHub Copilot está ativo
- Confirme as configurações no settings.json
- Reinicie o VS Code

**❌ API não é descoberta:**
- Verifique a URL no .env
- Teste autenticação se necessária
- Confirme se a API suporta introspection

### 📧 Contato

- **GitHub**: [seu-usuario/mcp-graphql-query-generator](https://github.com)
- **Issues**: Reporte bugs e sugestões
- **Documentação**: README.md e VSCODE-INTEGRATION.md

---

## 🎉 Pronto! 

Agora você tem um **MCP GraphQL Server** rodando globalmente, integrado ao VS Code e GitHub Copilot. Ele funcionará em **qualquer projeto** que você abrir no VS Code!

**Teste agora:** Abra qualquer projeto no VS Code e pergunte no Copilot Chat: *"Liste as queries GraphQL disponíveis"*