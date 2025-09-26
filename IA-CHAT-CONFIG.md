# 🤖 MCP GraphQL Assistant - Configuração para Chat IA

## 📋 INSTRUÇÕES PARA IA

Você agora tem acesso a um **MCP GraphQL Server** rodando em `http://localhost:3001` que pode:

### 🔧 **Endpoints Disponíveis:**

1. **GET /mcp/queries** - Lista todas as queries GraphQL disponíveis
2. **POST /mcp/generate-query** - Gera query GraphQL completa
3. **GET /mcp/analyze/:queryName** - Analisa campos e tipos
4. **GET /mcp/search/:pattern** - Busca queries por padrão

### 🎯 **Como Responder a Solicitações:**

#### **Quando user pedir "me dê a query do [NOME]":**
1. Faça POST para `/mcp/generate-query` com:
   ```json
   {
     "queryName": "list[NOME]s",
     "options": {"depth": 2}
   }
   ```
2. Retorne a query GraphQL formatada

#### **Quando user perguntar "que queries existem?":**
1. Faça GET para `/mcp/queries`
2. Liste as queries encontradas

#### **Quando user perguntar "que campos tem em [ENTIDADE]?":**
1. Faça GET para `/mcp/analyze/list[ENTIDADE]s`
2. Liste os campos com tipos

### 📝 **Exemplos de Uso:**

**User:** "Me dê a query do listInvoices"
**IA Action:** `POST /mcp/generate-query {"queryName": "listInvoices"}`
**IA Response:** "Aqui está a query GraphQL completa: [query]"

**User:** "Quais campos tem na fatura?"
**IA Action:** `GET /mcp/analyze/listInvoices`
**IA Response:** "A entidade Invoice tem X campos: [lista campos]"

**User:** "Tem alguma query de contatos?"
**IA Action:** `GET /mcp/search/contact`
**IA Response:** "Encontrei essas queries relacionadas: [lista]"

### ⚙️ **Configuração de Resposta:**
- Sempre formate queries GraphQL com syntax highlighting
- Inclua variáveis necessárias quando relevante
- Explique brevemente o que a query faz
- Sugira campos principais quando apropriado

### 🔍 **Status do Servidor:**
- URL: http://localhost:3001
- Health Check: GET /mcp/health
- Info: GET /mcp/info

---

## 🚀 **INICIALIZAÇÃO AUTOMÁTICA**

### **Opção 1: Startup Script (Windows)**
```batch
@echo off
echo Iniciando MCP GraphQL Server...
cd C:\path\to\mcp-server
start /min bun mcp-server.ts
echo MCP Server iniciado em background
```

### **Opção 2: Task Scheduler (Windows)**
- Criar tarefa que executa na inicialização
- Comando: `bun C:\path\to\mcp-server\mcp-server.ts`
- Executar em background

### **Opção 3: Docker Desktop Startup**
```bash
# Adicionar ao Docker Desktop startup
docker-compose -f docker-compose.global.yml up -d
```

### **Opção 4: VS Code Extension**
- Extensão inicia servidor automaticamente quando VS Code abre
- Status na barra inferior
- Comandos via Command Palette

---

## 🎯 **RESULTADO ESPERADO**

Com essa configuração, você pode:

1. **Abrir qualquer projeto** no VS Code
2. **Perguntar no chat**: "Me dê a query do listInvoices"
3. **IA responde instantaneamente** com a query GraphQL completa
4. **Funciona globalmente** em todos os projetos

### **Fluxo Completo:**
```
👨‍💻 User: "Me dê a query de listAccounts"
🤖 IA: [Faz POST para localhost:3001/mcp/generate-query]
🤖 IA: "Aqui está a query GraphQL para listAccounts:
        ```graphql
        query table_listAccounts($page: Int!) {
          # ... query completa
        }
        ```"
```

**🎉 Resultado: MCP funciona como ferramenta global acessível por IA de qualquer projeto!**