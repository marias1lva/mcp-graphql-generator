import express from 'express';
import { GenericQueryGenerator } from '../generators/genericQueryGenerator';

interface TableQueryOptions {
  includePagination?: boolean;
  includeFilters?: boolean;
  includeOrdering?: boolean;
  maxDepth?: number;
  selectedFields?: string[];
}

interface GenerateTableQueryRequest {
  queryName: string;
  options?: TableQueryOptions;
}

interface GenerateCustomQueryRequest {
  queryName: string;
  selectedFields: string[];
  options?: TableQueryOptions;
}

interface GenerateSimpleQueryRequest {
  queryName: string;
  maxDepth?: number;
}

export class MCPServer {
  private app = express();
  private queryGenerator = new GenericQueryGenerator();
  private port = process.env.PORT || 3000;

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    
    //CORS para permitir requisições do frontend
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      next();
    });
  }

  private setupRoutes() {
    //rota principal: gera query de tabela genérica
    this.app.post('/generate-table-query', async (req, res) => {
      try{
        const { queryName, options = {} }: GenerateTableQueryRequest = req.body;

        if(!queryName){
          return res.status(400).json({ 
            error: 'queryName is required (ex: "listInvoices")' 
          });
        }

        const query = await this.queryGenerator.generateTableQuery(queryName, options);
        res.json({ 
          query,
          queryName,
          generated_at: new Date().toISOString()
        });
      }catch (error){
        const err = error as Error;
        res.status(500).json({ 
          error: err.message,
          queryName: req.body?.queryName
        });
      }
    });

    //rota para listar todas as queries disponíveis
    this.app.get('/available-queries', async (req, res) => {
      try{
        const queries = await this.queryGenerator.getAvailableQueries();
        res.json({ 
          queries,
          count: queries.length,
          examples: queries.slice(0, 5) // Primeiros 5 como exemplo
        });
      }catch (error){
        const err = error as Error;
        res.status(500).json({ error: err.message });
      }
    });

    //rota para gerar query customizada com campos específicos
    this.app.post('/generate-custom-query', async (req, res) => {
      try{
        const { queryName, selectedFields, options = {} }: GenerateCustomQueryRequest = req.body;

        if(!queryName){
          return res.status(400).json({ error: 'queryName is required' });
        }

        if(!selectedFields || !Array.isArray(selectedFields)){
          return res.status(400).json({ 
            error: 'selectedFields must be an array of field names' 
          });
        }

        const query = await this.queryGenerator.generateCustomQuery(
          queryName, 
          selectedFields, 
          options
        );

        res.json({ 
          query,
          queryName,
          selectedFields,
          generated_at: new Date().toISOString()
        });
      }catch (error){
        const err = error as Error;
        res.status(500).json({ error: err.message });
      }
    });

    //rota para gerar query simples (sem paginação)
    this.app.post('/generate-simple-query', async (req, res) => {
      try{
        const { queryName, maxDepth = 1 }: GenerateSimpleQueryRequest = req.body;

        if(!queryName){
          return res.status(400).json({ error: 'queryName is required' });
        }

        const query = await this.queryGenerator.generateSimpleQuery(queryName, maxDepth);
        res.json({ 
          query,
          queryName,
          type: 'simple',
          maxDepth,
          generated_at: new Date().toISOString()
        });
      }catch (error){
        const err = error as Error;
        res.status(500).json({ error: err.message });
      }
    });

    //rota de saúde/status
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        service: 'MCP GraphQL Query Generator',
        version: '2.0.0',
        timestamp: new Date().toISOString()
      });
    });

    //rota de ajuda com exemplos
    this.app.get('/help', (req, res) => {
      res.json({
        service: 'MCP GraphQL Query Generator',
        description: 'Gerador genérico de queries GraphQL para tabelas',
        endpoints: {
          'POST /generate-table-query': {
            description: 'Gera query de tabela completa com paginação',
            body: {
              queryName: 'string (ex: "listInvoices")',
              options: {
                includePagination: 'boolean (default: true)',
                includeFilters: 'boolean (default: true)', 
                includeOrdering: 'boolean (default: true)',
                maxDepth: 'number (default: 2)',
                selectedFields: 'string[] (opcional)'
              }
            }
          },
          'GET /available-queries': {
            description: 'Lista todas as queries "list*" disponíveis na API'
          },
          'POST /generate-custom-query': {
            description: 'Gera query com campos específicos',
            body: {
              queryName: 'string',
              selectedFields: 'string[]',
              options: 'TableQueryOptions'
            }
          },
          'POST /generate-simple-query': {
            description: 'Gera query simples sem paginação',
            body: {
              queryName: 'string',
              maxDepth: 'number (default: 1)'
            }
          }
        },
        examples: [
          'curl -X POST http://localhost:3000/generate-table-query -H "Content-Type: application/json" -d \'{"queryName": "listInvoices"}\'',
          'curl -X GET http://localhost:3000/available-queries',
          'curl -X POST http://localhost:3000/generate-custom-query -H "Content-Type: application/json" -d \'{"queryName": "listInvoices", "selectedFields": ["id", "status", "number"]}\''
        ]
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 MCP GraphQL Query Generator running on http://localhost:${this.port}`);
      console.log(`📖 API documentation: http://localhost:${this.port}/help`);
      console.log(`🔍 Available queries: http://localhost:${this.port}/available-queries`);
    });
  }

  public getApp() {
    return this.app;
  }
}