# 🚀 MCP GraphQL Query Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh/)

A smart **Model Context Protocol (MCP)** server that automatically discovers and generates GraphQL queries for any API. Perfect for VS Code integration with GitHub Copilot!

## 🎯 What is this?

This tool **automatically introspects any GraphQL API** and generates intelligent queries with:
- ✅ **Table-formatted** results with pagination
- ✅ **Smart field selection** based on types
- ✅ **Filtering and sorting** capabilities  
- ✅ **VS Code integration** via MCP
- ✅ **GitHub Copilot** integration for natural language queries

## 🌟 Key Features

### 🔍 **Automatic Discovery**
- Discovers all `list*` queries in any GraphQL API
- No manual configuration needed
- Supports complex nested types

### 💬 **Natural Language Interface**
Ask GitHub Copilot in VS Code:
- *"List all available GraphQL queries"*
- *"Generate a query to list users with pagination"*
- *"What fields are available in the Product type?"*

### 🛠️ **Multiple Interfaces**
- **CLI** - Interactive command line
- **REST API** - For programmatic access
- **MCP Server** - VS Code integration
- **HTTP Server** - Web interface

### 🔒 **Secure & Flexible**
- Multiple auth methods (Bearer, API Key, Keycloak)
- Environment variable configuration
- TypeScript type safety

## 🚀 Quick Start

### Option 1: VS Code Global Installation (Recommended)

```bash
# 1. Install Bun (if not installed)
powershell -c "irm bun.sh/install.ps1 | iex"

# 2. Clone and install globally
git clone https://github.com/yourusername/mcp-graphql-query-generator.git
cd mcp-graphql-query-generator
.\install-global.ps1

# 3. Configure your API
notepad "%APPDATA%\MCPGraphQLServer\.env"
```

Add to your VS Code `settings.json`:
```json
{
  "mcp.servers": {
    "graphql-query-generator": {
      "name": "GraphQL Query Generator",
      "url": "http://localhost:3001",
      "enabled": true
    }
  }
}
```

### Option 2: Local Development

```bash
# Install dependencies
bun install

# Configure API
cp .env.example .env
# Edit .env with your GraphQL API URL

# Start server
bun mcp-server.ts

# Or use CLI
bun src/cli.ts list
```

## ⚙️ Configuration

Create `.env` file:
```bash
# Your GraphQL API URL
GRAPHQL_API_URL=https://your-api.example.com/graphql

# Authentication (choose one)
API_TOKEN=your_bearer_token
# OR
API_KEY=your_api_key
# OR Keycloak
KEYCLOAK_CLIENT_ID=your_client_id
KEYCLOAK_CLIENT_SECRET=your_secret
KEYCLOAK_URL=https://your-keycloak.example.com/auth
KEYCLOAK_REALM=your-realm

# Server settings
MCP_PORT=3001
MAX_DEPTH=3
```

## 📋 Usage Examples

### CLI Usage
```bash
# List available queries
bun src/cli.ts list

# Generate a query
bun src/cli.ts generate listUsers --pagination --depth 2

# Test connection
bun src/cli.ts test
```

### REST API Usage
```bash
# Get available queries
curl http://localhost:3001/mcp/queries

# Generate specific query
curl -X POST http://localhost:3001/mcp/generate-query \
  -H "Content-Type: application/json" \
  -d '{"queryName": "listUsers", "options": {"includePagination": true}}'
```

### VS Code + Copilot Usage
Once installed globally, ask GitHub Copilot:
- *"Show me all GraphQL queries available"*
- *"Generate a paginated query for products"*
- *"What fields does the User type have?"*

## 🏗️ Architecture

```
mcp-graphql-query-generator/
├── src/
│   ├── cli.ts                  # Command line interface
│   ├── mcp/server.ts          # MCP server for VS Code
│   ├── generators/            # Query generation logic
│   ├── services/              # GraphQL introspection
│   └── config/                # Configuration management
├── install-global.ps1         # Global installation script
├── CHECKLIST-RAPIDO.md       # Quick setup guide
└── README.md                  # This file
```

## 🔧 Development

```bash
# Install dependencies
bun install

# Start in development mode
bun --watch mcp-server.ts

# Run tests
bun test

# Build for production
bun build
```

## 🚦 API Compatibility

Works with any GraphQL API that supports introspection, including:
- ✅ **Apollo Server**
- ✅ **GraphQL Yoga** 
- ✅ **Hasura**
- ✅ **PostGraphile**
- ✅ **AWS AppSync**
- ✅ **Shopify Admin API**
- ✅ **GitHub GraphQL API**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.sh/) for blazing fast performance
- Uses [Model Context Protocol](https://modelcontextprotocol.io/) for VS Code integration
- Inspired by GraphQL introspection capabilities

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/mcp-graphql-query-generator/issues)  
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/mcp-graphql-query-generator/discussions)
- 📧 **Email**: your.email@example.com

---

⭐ **Star this repo if it helped you!** ⭐