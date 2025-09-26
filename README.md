# 🚀 MCP GraphQL Query Generator

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-000000?logo=github&logoColor=white)](https://copilot.github.com/)


**A smart Model Context Protocol (MCP) server that automatically discovers and generates GraphQL queries for any API.**
**Works with VS Code + GitHub Copilot, CLI, and REST API to make exploring and using GraphQL APIs effortless.**

*Perfect for VS Code integration with GitHub Copilot! 🤖*

[Quick Start](#-quick-start) • [Features](#-features) • [VS Code Setup](#-vs-code-integration) • [API Reference](#-api-reference) • [Examples](#-examples)

</div>

---
## What is MCP?
The Model Context Protocol (MCP) is a new protocol that lets tools, APIs, and models talk to each other in a structured way.
Instead of manually copying data into your IDE or chat window, MCP servers can:
    - Provide real-time API access directly inside VS Code or AI tools.
    - Enable natural language queries ("show me all products with pagination").
    - Act as connectors between AI assistants (like Copilot) and external systems.
This project is an MCP server for GraphQL APIs:
    - It introspects any GraphQL schema.
    - Generates queries automatically.
    - Exposes them through CLI, REST, and VS Code integration.
In short: you don’t need to handcraft GraphQL queries anymore — just ask, and they’re generated for you.

## What is this?

This tool **automatically introspects any GraphQL API** and generates intelligent, production-ready queries with:

- **Auto-discovery** of all available queries and types in your GraphQL API
- **Smart field selecion**, including nested types
- **Table-formatted** queries with pagination, filtering, and sorting
- **Natural language** integration with GitHub Copilot
- **Zero configuration** - just point it to your GraphQL endpoint
- **Multi-auth support** (Bearer, API Key, Keycloak, etc.)
- **Multiple interfaces** (CLI, REST API, MCP Server, Web UI)

## Features

### **For Developers**
- **Instant GraphQL exploration** - No need to read documentation
- **Smart query generation** - Automatically includes relevant fields
- **Production-ready queries** - With proper pagination and error handling
- **Type-safe** - Full TypeScript support

### **For AI Integration**
- **GitHub Copilot integration** - Ask questions in natural language
- **VS Code extension ready** - Works globally across all projects
- **Context-aware** - Understands your API structure
- **Intelligent suggestions** - Based on your schema

### **For Teams**
- **Consistent query patterns** - Standardized across projects
- **Documentation generator** - Auto-generates API insights
- **Multi-environment** - Dev, staging, prod configurations
- **Docker ready** - Easy deployment and scaling

## Quick Start

### Option 1: Global VS Code Installation (Recommended)

Transform VS Code into a GraphQL powerhouse in 2 minutes:

```powershell
# 1. Install Bun runtime (faster than Node.js)
powershell -c "irm bun.sh/install.ps1 | iex"

# 2. Clone and install globally
git clone https://github.com/marias1lva/mcp-graphql-generator.git
cd mcp-graphql-generator
.\install-global.ps1

# 3. Add to VS Code settings.json:
{
  "mcp.servers": {
    "graphql-query-generator": {
      "name": "GraphQL Query Generator",
      "url": "http://localhost:3001",
      "enabled": true
    }
  }
}

# 4. Configure your API
notepad %APPDATA%\MCPGraphQLServer\.env
# Add: GRAPHQL_API_URL=https://your-api.example.com/graphql
```

**That's it!** Now ask GitHub Copilot: *"List available GraphQL queries"*

### Option 2: Local Development

```bash
# Clone and setup
git clone https://github.com/marias1lva/mcp-graphql-generator.git
cd mcp-graphql-generator
bun install

# Configure API
cp .env.example .env
# Edit .env with your GraphQL API URL

# Start MCP server
bun mcp-server.ts

# Or use CLI directly
bun src/cli.ts list
bun src/cli.ts generate listUsers
```

## VS Code Integration

Once installed, use natural language with GitHub Copilot:

```
👤 "List all available GraphQL queries"
🤖 Found these queries:
   • listUsers - Get all users with pagination
   • listProducts - Browse products catalog  
   • listOrders - View order history

👤 "Generate a query to get users with their profiles"
🤖 query ListUsers($first: Int, $after: String) {
     listUsers(first: $first, after: $after) {
       edges {
         node {
           id
           name
           email
           profile {
             firstName
             lastName
             avatar
           }
         }
       }
       pageInfo {
         hasNextPage
         endCursor
       }
     }
   }

👤 "What fields are available in the Product type?"
🤖 Product type fields:
   • id (ID!) - Unique identifier
   • name (String!) - Product name
   • price (Float!) - Product price
   • description (String) - Product description
   • category (Category) - Product category
```

## Usage Options

### 1. **CLI Interface**

```bash
# Discover available queries
bun src/cli.ts list

# Generate a specific query
bun src/cli.ts generate listUsers

# Generate with options
bun src/cli.ts generate listProducts --depth 3 --pagination

# Interactive mode
bun src/cli.ts interactive
```

### 2. **REST API**

```http
### Get all available queries
GET http://localhost:3001/mcp/queries

### Generate a specific query
POST http://localhost:3001/mcp/generate-query
Content-Type: application/json

{
  "queryName": "listUsers",
  "options": {
    "includePagination": true,
    "maxDepth": 2,
    "selectedFields": ["id", "name", "email"]
  }
}

### Analyze a type
GET http://localhost:3001/mcp/analyze/User
```

### 3. **Programmatic Usage**

```typescript
import { GenericQueryGenerator } from './src/generators/genericQueryGenerator';

const generator = new GenericQueryGenerator();

// Get available queries
const queries = await generator.getAvailableQueries();

// Generate a table query
const query = await generator.generateTableQuery('listUsers', {
  includePagination: true,
  maxDepth: 2
});

// Generate custom query
const customQuery = await generator.generateCustomQuery('listUsers', 
  ['id', 'name', 'email'], 
  { includePagination: true }
);
```

## Configuration

### Environment Variables

```bash
# Required: Your GraphQL API endpoint
GRAPHQL_API_URL=https://your-api.example.com/graphql

# Optional: Authentication
API_TOKEN=your_bearer_token
API_KEY=your_api_key

# Optional: Keycloak authentication
KEYCLOAK_CLIENT_ID=your_client_id
KEYCLOAK_CLIENT_SECRET=your_client_secret
KEYCLOAK_URL=https://your-keycloak.example.com/auth
KEYCLOAK_REALM=your-realm

# Optional: Server configuration
MCP_PORT=3001
MAX_DEPTH=3
```

### Per-Project Configuration

Create `.vscode/settings.json` in your project:

```json
{
  "mcpGraphQL.projectSettings": {
    "apiUrl": "https://project-specific-api.com/graphql",
    "authToken": "${env:PROJECT_API_TOKEN}",
    "defaultDepth": 2,
    "enablePagination": true
  }
}
```

## Examples

### Example Output - List Users Query

```graphql
query ListUsers($first: Int, $after: String, $orderBy: UserOrderByInput) {
  listUsers(first: $first, after: $after, orderBy: $orderBy) {
    edges {
      node {
        id
        name
        email
        createdAt
        profile {
          firstName
          lastName
          avatar
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### Example Output - Products with Categories

```graphql
query ListProducts($first: Int, $after: String, $filters: ProductFiltersInput) {
  listProducts(first: $first, after: $after, filters: $filters) {
    edges {
      node {
        id
        name
        price
        description
        category {
          id
          name
          slug
        }
        images {
          url
          alt
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## Architecture

```
mcp-graphql-generator/
├── src/
│   ├── cli.ts                     # Command line interface
│   ├── app.ts                     # HTTP server entry point
│   ├── generators/
│   │   └── genericQueryGenerator.ts  # Core query generation logic
│   ├── services/
│   │   ├── graphqlIntrospection.ts   # API discovery service
│   │   └── keycloakAuth.ts           # Authentication service
│   ├── mcp/
│   │   └── server.ts                 # MCP protocol server
│   ├── config/
│   │   └── credentials.ts            # Credential management
│   └── types/
│       ├── auth.ts                   # Authentication types
│       └── env.d.ts                  # Environment types
├── mcp-server.ts              # MCP server entry point
├── install-global.ps1         # Global VS Code installation
├── configure-autostart.ps1    # Auto-start configuration
├── docker-compose.global.yml  # Docker deployment
└── docs/                      # Additional documentation
```

## Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  mcp-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      - GRAPHQL_API_URL=https://your-api.example.com/graphql
      - API_TOKEN=your_token
    restart: unless-stopped
```

```bash
# Deploy with Docker
docker-compose up -d

# Or with Docker directly
docker build -t mcp-graphql-generator .
docker run -p 3001:3001 -e GRAPHQL_API_URL=https://your-api.com/graphql mcp-graphql-generator
```

## API Compatibility

Works with any GraphQL API that supports introspection, including:

- ✅ **Apollo Server** - Full compatibility
- ✅ **GraphQL Yoga** - Full compatibility  
- ✅ **Hasura** - Including metadata queries
- ✅ **Postgraphile** - Auto-generated CRUD
- ✅ **AWS AppSync** - With custom resolvers
- ✅ **Shopify Admin API** - E-commerce queries
- ✅ **GitHub GraphQL API** - Repository data
- ✅ **Strapi GraphQL** - Headless CMS
- ✅ **Contentful** - Content management
- ✅ **Custom GraphQL APIs** - Any introspection-enabled API

## Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/marias1lva/mcp-graphql-generator.git
cd mcp-graphql-generator

# Install dependencies
bun install

# Copy environment template
cp .env.example .env
# Edit .env with your test GraphQL API

# Start in development mode
bun --watch mcp-server.ts

# Run CLI in development
bun --watch src/cli.ts list

# Build for production
bun build

# Run tests (when implemented)
bun test
```

### Project Scripts

```json
{
  "scripts": {
    "start": "bun src/app.ts",
    "dev": "bun --watch mcp-server.ts", 
    "build": "bun build",
    "cli": "bun src/cli.ts",
    "cli:list": "bun src/cli.ts list",
    "cli:interactive": "bun src/cli.ts interactive"
  }
}
```

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with proper TypeScript types
4. **Test** your changes with a real GraphQL API
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Contribution Guidelines

- **TypeScript** - All code must be properly typed
- **Bun** - Use Bun for package management and runtime
- **Testing** - Include tests for new features
- **Documentation** - Update README and inline docs
- **Code Style** - Follow existing patterns

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[Bun](https://bun.sh/)** - For blazing fast JavaScript runtime
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - For VS Code integration standard  
- **[GraphQL](https://graphql.org/)** - For the amazing query language
- **[GitHub Copilot](https://copilot.github.com/)** - For AI-powered development
- **[TypeScript](https://www.typescriptlang.org/)** - For type safety and developer experience

---

<div align="center">

**⭐ Star this repo if it helped you! ⭐**

</div>