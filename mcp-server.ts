import express from 'express';
import cors from 'cors';
import { GenericQueryGenerator } from './src/generators/genericQueryGenerator.js';

const app = express();
const port = process.env.MCP_PORT || 3001;

//middleware
app.use(cors());
app.use(express.json());

//instance do gerador
const generator = new GenericQueryGenerator();

// ==========================================
// ENDPOINTS PARA IA CHAT
// ==========================================

// 1. lista todas as queries disponíveis
app.get('/mcp/queries', async (req, res) => {
  try{
    const queries = await generator.getAvailableQueries();
    res.json({
      success: true,
      count: queries.length,
      queries: queries
    });
  }catch (error){
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// 2. gera query GraphQL completa
app.post('/mcp/generate-query', async (req, res) => {
  try{
    const { queryName, options = {} } = req.body;
    
    if(!queryName){
      return res.status(400).json({
        success: false,
        error: 'queryName é obrigatório'
      });
    }

    const query = await generator.generateTableQuery(queryName, {
      includePagination: options.pagination !== false,
      includeFilters: options.filters !== false,
      includeOrdering: options.ordering !== false,
      maxDepth: options.depth || 2
    });

    res.json({
      success: true,
      queryName,
      query,
      options: options
    });
  }catch (error){
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// 3. analisa campos de uma query específica
app.get('/mcp/analyze/:queryName', async (req, res) => {
  try{
    const { queryName } = req.params;
    const { scalarsOnly = false } = req.query;
    
    const introspection = generator.introspection;
    const allFields = await introspection.getFieldsForQuery(queryName);
    
    let fields = allFields;
    if(scalarsOnly === 'true'){
      fields = allFields.filter(field => 
        ['String', 'Int', 'Float', 'Boolean', 'ID', 'DateTime', 'Date'].includes(field.type)
      );
    }

    const scalarCount = allFields.filter(field => 
      ['String', 'Int', 'Float', 'Boolean', 'ID', 'DateTime', 'Date'].includes(field.type)
    ).length;

    res.json({
      success: true,
      queryName,
      totalFields: allFields.length,
      scalarFields: scalarCount,
      objectFields: allFields.length - scalarCount,
      fields: fields.map(field => ({
        name: field.name,
        type: field.type,
        isRequired: field.isRequired,
        isArray: field.isArray,
        hasSubfields: !!(field.fields && field.fields.length > 0)
      }))
    });
  }catch (error){
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// 4. busca queries por padrão
app.get('/mcp/search/:pattern', async (req, res) => {
  try{
    const { pattern } = req.params;
    const queries = await generator.getAvailableQueries();
    
    const filtered = queries.filter(query => 
      query.toLowerCase().includes(pattern.toLowerCase())
    );

    res.json({
      success: true,
      pattern,
      count: filtered.length,
      queries: filtered
    });
  }catch (error){
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// 5. health check
app.get('/mcp/health', (req, res) => {
  res.json({
    success: true,
    service: 'MCP GraphQL Query Generator',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 6. informações do servidor para IA
app.get('/mcp/info', async (req, res) => {
  try{
    const queries = await generator.getAvailableQueries();
    res.json({
      success: true,
      service: 'MCP GraphQL Query Generator',
      capabilities: [
        'Lista queries GraphQL disponíveis',
        'Gera queries completas com paginação',
        'Analisa campos e tipos de dados',
        'Busca queries por padrão'
      ],
      endpoints: {
        'GET /mcp/queries': 'Lista todas as queries disponíveis',
        'POST /mcp/generate-query': 'Gera query GraphQL completa',
        'GET /mcp/analyze/:queryName': 'Analisa campos de uma query',
        'GET /mcp/search/:pattern': 'Busca queries por padrão'
      },
      totalQueries: queries.length,
      apiUrl: process.env.GRAPHQL_API_URL || 'https://your-api.example.com/graphql'
    });
  }catch (error){
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});


// INICIALIZAÇÃO
app.listen(port, () => {
  console.log(`🤖 MCP Server rodando na porta ${port}`);
  console.log(`📖 Informações: http://localhost:${port}/mcp/info`);
  console.log(`🔍 Health check: http://localhost:${port}/mcp/health`);
  console.log(`\n🎯 Endpoints para IA:`);
  console.log(`   GET  /mcp/queries              - Lista queries`);
  console.log(`   POST /mcp/generate-query       - Gera query`);
  console.log(`   GET  /mcp/analyze/:queryName   - Analisa campos`);
  console.log(`   GET  /mcp/search/:pattern      - Busca queries`);
});

export default app;